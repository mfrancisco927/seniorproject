import { useContext, createContext, useState, useEffect, useRef } from "react";
import { refreshSpotifyToken }  from './../api/authenticationApi';
import { playTrack } from './../api/spotifyApi';
import { useAuth } from './../hooks/authHooks';
import WebPlaybackReact from './WebPlaybackReact';

const sdkContext = createContext();

export function useSpotifySdk() {
  return useContext(sdkContext);
}

export function ProvideSpotify({ children }) {
  const auth = useAuth();
  const spotifyTokenRef = useRef(null);
  const deviceIdRef = useRef(null);
  const [playerLoaded, setPlayerLoaded] = useState(false);
  const [playerSelected, setPlayerSelected] = useState(false);
  const [playerReady, setPlayerReady] = useState(false);
  const [playerState, setPlayerState] = useState({});
  const [stateCallbacks, setStateCallbacks] = useState({});
  const [onReadyCallbacks, setOnReadyCallbacks] = useState({});
  const [onDeviceSelectedCallbacks, setOnDeviceSelectedCallbacks] = useState({});
  const [playerRef, setPlayerRef] = useState(null);

  const [trackEnded, setTrackEnded] = useState(false);
  const [playing, setPlaying] = useState(false);
  const [volume, setVolume] = useState(null);

  const handleNewState = async (nextState) => {
    // update our pause button
    if (nextState) {
      setPlaying(!nextState.paused);
      
      if (!nextState.paused) {
        setTrackEnded(false);
      }

      if (playerRef) {
        setVolume(await playerRef.getVolume());
      }
    }

    // check for the end of the track
    // spotify doesn't have any sort of "song ended" callback sadly,
    // so this borrows from this answer: https://github.com/spotify/web-playback-sdk/issues/35#issuecomment-509159445
    if (!trackEnded && playerState
      && nextState.track_window.previous_tracks.find(x => x.id === nextState.track_window.current_track.id)
      && !playerState.paused
      && nextState.paused) {
        // console.log('Track ended');
        setTrackEnded(true);
    }
  };

  const addOnReadyListeners = (keyCallbackPairs) => {
    Object.entries(keyCallbackPairs).forEach(entry => {
      console.log('Registered onReady callback:', entry[0]);
    });
    setOnReadyCallbacks({...onReadyCallbacks, ...keyCallbackPairs});
  }

  const addOnDeviceSelectedListeners = (keyCallbackPairs) => {
    Object.entries(keyCallbackPairs).forEach(entry => {
      console.log('Registered onDeviceSelected callback:', entry[0]);
    });
    setOnDeviceSelectedCallbacks({...onDeviceSelectedCallbacks, ...keyCallbackPairs});
  }

  const addStateListeners = (keyCallbackPairs) => {
    // TODO: fix this. right now, it thinks stateCallbacks is empty even after adding
    // a listener, so if you try to add a second listener it essentially overwrites the first
    Object.entries(keyCallbackPairs).forEach(entry => {
      console.log('Registered onStateChanged callback:', entry[0]);
    });
    const allCallbacks = {...stateCallbacks, ...keyCallbackPairs};
    setStateCallbacks(allCallbacks);
    console.log('New state callbacks registered. All callbacks: ', allCallbacks);
  };

  const webPlaybackSdkProps = {
    playerName: "BeachWorm Player",
    playerInitialVolume: 1.0,
    playerRefreshRateMs: 100,
    playerAutoConnect: true,
    onPlayerRequestAccessToken: (async () => {
      if (!spotifyTokenRef.current) {
        if (auth.user) {
          const newToken = await refreshSpotifyToken().then(result => {
            spotifyTokenRef.current = result;
            localStorage.setItem('spotify_access_token', result)
          }, reject => {
            return null;
          });
          return newToken;
        }
        return null;
      }
      return spotifyTokenRef.current;
    }),
    onPlayerLoading: (() => setPlayerLoaded(true)),
    onPlayerWaitingForDevice: (data => {
      setPlayerSelected(false); 
      setPlayerReady(true);
      deviceIdRef.current = data.device_id;
      Object.entries(onReadyCallbacks).forEach(entry => {
        entry[1](data);
      });
    }),
    onPlayerDeviceSelected: () => {
      setPlayerSelected(true);
      // notify all stored listeners
      Object.entries(onDeviceSelectedCallbacks).forEach(entry => entry[1]());
    },
    onPlayerStateChange: (newState) => {
      setPlayerState(newState);
      // update other state vars locally
      handleNewState(newState);
      // notify all stored listeners
      Object.entries(stateCallbacks).forEach(entry => entry[1](newState));
    },
    onPlayerError: (playerError => console.error(playerError))
  };

  return (
    <sdkContext.Provider value={useProvideSdk()}>
      {/* remove the player from the hierarchy if there's no user logged in */}
      {auth.user ? (
        <WebPlaybackReact {...webPlaybackSdkProps} ref={(e) => e ? setPlayerRef(e.webPlaybackInstance) : setPlayerRef(e)}>
          {children}
        </WebPlaybackReact>
      ) : children}
    </sdkContext.Provider>
  );

  function useProvideSdk() {
    const [contextPlayQueue, setContextPlayQueue] = useState({ 'name': undefined, 'songs': [] });
    const [userPlayQueue, setUserPlayQueue] = useState([]);
    const [shuffle, setShuffle] = useState(false);
    const [muted, setMuted] = useState(false);
    const [autoplay, setAutoplay] = useState(true);

    useEffect(() => {
      if (trackEnded) {
        // TODO: fire 'listened to' endpoint to add to user history
        console.log('Track ending detected');
        if (autoplay) {
          const nextSong = dequeueNextSong(shuffle);
          if (nextSong) {
            refreshWrapper(play)(nextSong.id);
          }
        }
      }
    }, [trackEnded]);
  
    // const onlyIfLoadedWrapper = (callback) => {
    //   if (isPlayerLoaded) {
    //     return (params) => callback(params);
    //   } else {
    //     console.error('Cannot use ' + callback.name + ' before player is loaded!');
    //   }
    // }
  
    const refreshToken = async () => {
      return refreshSpotifyToken().then(result => {
        if (result) {
          spotifyTokenRef.current = result.access_token;
          localStorage.setItem('spotify_access_token', result.access_token);
          return Promise.resolve(result);
        } else {
          return Promise.reject('No access token from endpoint');
        }
      }, reject => {
        console.log('Access token failed to refresh')
      });
    };
  
    const refreshAndTry = async (callback, parameters, firstTry) => {
      const attempt = async () => {
        try {
          return await new Promise(() => {
            try {
              parameters ? callback(parameters) : callback();
              Promise.resolve();
            } catch (e) {
              throw e;
            }
          });
        } catch (e) {
          console.log('Error in refreshable function', e);
          if (firstTry) {
            console.log('Attempting to retrieve new Spotify token');
            await refreshToken();
            return refreshAndTry(callback, parameters, false);
          }
        }
      };
  
      // if spotify endpoint tells us we don't have the auth, refresh token and try again
      if (!spotifyTokenRef.current) {
        console.log(`Called a Spotify auth-required function, but we have no access token. Will try to refresh token then attempt.`);
        refreshToken().then(result => {
          console.log('Attempt succeeded, received token', result);
          attempt();
        }, reject => {
          console.log('Attempt to refresh token failed. Giving up.');
        });
      } else {
        attempt();
      }
    }
  
    const refreshWrapper = (callback) => {
      return (parameters) => {
        refreshAndTry(callback, parameters, true);
      }
    };
  
    const pause = async () => {
      console.log('Pausing current song');
      return playerRef.pause();
    };
  
    const play = async (songId) => {
      console.log(songId ? 'Playing song with id ' + songId : 'Resuming current song');
      return songId ? playTrack(songId, deviceIdRef.current, spotifyTokenRef.current) : playerRef.resume();
    };
  
    const togglePlaying = async () => {
      console.log('Toggling playback status');
      return playerRef.togglePlay();
    };
  
    const seek = async (millis) => {
      const seconds = Math.floor(millis / 1000) % 60;
      const minutes = Math.floor(millis / 1000 / 60);
      console.log('Skipping to time ' + (minutes) + ':' + seconds);
      return playerRef.seek(millis);
    };
  
    // adds a list of songs to the context play queue.
    // context here means that they're added because of where the user is,
    // not because the user specifically requested. for example,
    // if you play a song in the middle of a playlist, the following songs
    // in the playlist should be added here.
    const addToContextPlayQueue = (songs) => {
      setContextPlayQueue({
        name: contextPlayQueue.name,
        songs: [...contextPlayQueue.songs, ...songs]
      });
    }
  
    // adds a list of songs to the user requested play queue. this queue
    // always has priority over the context queue. for example, if the user
    // is currently playing a playlist, but presses the "add to queue" button
    // on a specific song, that song will play BEFORE the songs in 
    // the current playlist context
    const addToUserPlayQueue = (songs) => {
      setUserPlayQueue([...userPlayQueue, ...songs]);
    }
  
    const clearUserPlayQueue = () => {
      console.log('Clearing user play queue');
      setUserPlayQueue([]);
    }
  
    const clearContextPlayQueue = () => {
      console.log('Clearing context play queue');
      setContextPlayQueue({ name: undefined, songs: []});
    }
  
    // TODO: rework shuffle index or rng seed to a state variable so that
    // peek and dequeue return the same song
    const dequeueNextSong = () => {
      // regardless of shuffle status, always try to take the front of the play queue first
      if (userPlayQueue.length) {
        const song = userPlayQueue[0];
        setUserPlayQueue(userPlayQueue.slice(1));
        return song;
      } else {
        // if play queue is empty, generate an index and pop it while removing everything else
        const index = shuffle ? Math.floor(Math.random() * contextPlayQueue.length) : 0;
        const removed = contextPlayQueue[index];
        setContextPlayQueue([...contextPlayQueue.slice(0, index), ...contextPlayQueue.slice(index + 1)])
        return removed;
      }
    }

    const peekNextSong = () => {
      // regardless of shuffle status, always try to take the front of the play queue first
      if (userPlayQueue.length) {
        return userPlayQueue[0];
      } else {
        // if play queue is empty, generate an index and pop it while removing everything else
        const index = shuffle ? Math.floor(Math.random() * contextPlayQueue.length) : 0;
        const peeked = contextPlayQueue[index];
        return peeked;
      }
    }
  
    const getUserPlayQueue = () => {
      return [...userPlayQueue];
    }
  
    const getContextPlayQueue = () => {
      return contextPlayQueue;
    }
  
    const deleteUserQueueSong = (index) => {
      console.log('Deleting index ' + index + ' from user queue');
      setUserPlayQueue([...userPlayQueue.slice(0, index), ...userPlayQueue.slice(index + 1)]);
    }
  
    const deleteContextQueueSong = (index) => {
      console.log('Deleting index ' + index + ' from context queue');
      setContextPlayQueue({
        name: contextPlayQueue.name,
        songs: [...contextPlayQueue.slice(0, index), ...contextPlayQueue.slice(index + 1)]
      });
    }
  
    const setVolume = (volume) => {
      const roundedVol = Math.round(volume * 100000) / 1000;
      console.log('Setting volume to ' + volume + ' (' + roundedVol + '%)');
      return playerRef.setVolume(volume);
    }

    const skip = () => {
      const refreshWrappedPlay = refreshWrapper(play);
      const nextSong = dequeueNextSong();
      if (nextSong) {
        refreshWrappedPlay(nextSong.id);
      }
    }
  
    return {
      // current song controls
      resume: refreshWrapper(() => {play()}),
      pause: refreshWrapper(pause),
      play: refreshWrapper(play),
      togglePlay: refreshWrapper(togglePlaying),
      seek: refreshWrapper(seek),
      skip: skip,
      // general playback/info controls
      isPlaying: () => playing,
      setShuffle: setShuffle,
      isShuffling: () => shuffle,
      dequeueNextSong: dequeueNextSong,
      peekNextSong: peekNextSong,
      setAutoplay: setAutoplay,
      isAutoplaying: () => autoplay,
      // volume controls
      setVolume: setVolume,
      getVolume: () => volume,
      isMuted: () => muted,
      setMuted: setMuted,
      // up next (queue) controls
      getUserPlayQueue: getUserPlayQueue,
      addToUserPlayQueue: addToUserPlayQueue,
      deleteUserQueueSong: deleteUserQueueSong,
      clearUserPlayQueue: clearUserPlayQueue,
      setUserPlayQueue: setUserPlayQueue,
      getContextPlayQueue: getContextPlayQueue,
      addToContextPlayQueue: addToContextPlayQueue,
      deleteContextQueueSong: deleteContextQueueSong,
      clearContextPlayQueue: clearContextPlayQueue,
      setContextPlayQueue: setContextPlayQueue,
      // various functions
      addStateListeners: addStateListeners,
      addOnReadyListeners: addOnReadyListeners,
      addOnDeviceSelectedListeners: addOnDeviceSelectedListeners,
      getPlayerState: () => playerState,
      isPlayerReady: () => playerReady,
    };
  }
}
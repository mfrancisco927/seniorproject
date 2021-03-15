import { useContext, createContext, useState, useEffect } from "react";
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
  const [spotifyToken, setSpotifyToken] = useState(null);
  const [deviceId, setDeviceId] = useState(null);
  const [playerLoaded, setPlayerLoaded] = useState(false);
  const [playerSelected, setPlayerSelected] = useState(false);
  const [playerState, setPlayerState] = useState({});
  const [stateCallbacks, setStateCallbacks] = useState({});
  const [playerRef, setPlayerRef] = useState(null);


  const [trackEnded, setTrackEnded] = useState(false);
  const [playing, setPlaying] = useState(false);

  const handleNewState = (nextState) => {
    // update our pause button
    if (nextState) {
      setPlaying(!nextState.paused);
      
      if (!nextState.paused) {
        setTrackEnded(false);
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

  const sdk = useProvideSdk(
    () => spotifyToken,
    setSpotifyToken,
    () => deviceId,
    (keyCallbackPairs) => {
      // TODO: fix this. right now, it thinks stateCallbacks is empty even after adding
      // a listener, so if you try to add a second listener it essentially overwrites the first
      const allCallbacks = {...stateCallbacks, ...keyCallbackPairs};
      setStateCallbacks(allCallbacks);
      console.log('New state callbacks registered. All callbacks: ', allCallbacks);
    },
    () => playerRef,
  );
  
  const webPlaybackSdkProps = {
    playerName: "BeachWorm Player",
    playerInitialVolume: 1.0,
    playerRefreshRateMs: 100,
    playerAutoConnect: true,
    onPlayerRequestAccessToken: (async () => {
      if (!spotifyToken) {
        if (auth.user) {
          const newToken = await refreshSpotifyToken().then(result => {
            setSpotifyToken(result);
            localStorage.setItem('spotify_access_token', result)
          }, reject => {
            return null;
          });
          return newToken;
        }
        return null;
      }
      return spotifyToken;
    }),
    onPlayerLoading: (() => setPlayerLoaded(true)),
    onPlayerWaitingForDevice: (data => {
      setPlayerSelected(false); 
      setDeviceId(data.device_id); 
    }),
    onPlayerDeviceSelected: () => setPlayerSelected(true),
    onPlayerStateChange: (newState) => {
      setPlayerState(newState);

      // notify all stored listeners
      Object.entries(stateCallbacks).forEach(entry => {
        // console.log('Sending update to hook ' + entry[0]);
        const cb = entry[1];
        cb(newState);
      })

      // update other state vars
      handleNewState(newState);
    },
    onPlayerError: (playerError => console.error(playerError))
  };

  return (
    <sdkContext.Provider value={sdk}>
      <WebPlaybackReact {...webPlaybackSdkProps} ref={(e) => e ? setPlayerRef(e.webPlaybackInstance) : setPlayerRef(e)}>
        {children}
      </WebPlaybackReact>
    </sdkContext.Provider>
  );

  function useProvideSdk(getAccessToken, setAccessToken, getDeviceId, addStateListener, getPlayer) {
    const [contextPlayQueue, setContextPlayQueue] = useState([]);
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
          setAccessToken(result.access_token);
          localStorage.setItem('spotify_access_token', result.access_token);
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
      if (!getAccessToken()) {
        console.log(`Called a Spotify auth-required function, but we have no access token. Will try to refresh token then attempt.`);
        refreshToken().then(() => attempt(), reject => {
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
      return getPlayer().pause();
    };
  
    const play = async (songId) => {
      console.log(songId ? 'Playing song with id ' + songId : 'Resuming current song');
      return songId ? playTrack(songId, getDeviceId(), getAccessToken()) : getPlayer().resume();
    };
  
    const togglePlaying = async () => {
      console.log('Toggling play');
      return getPlayer().togglePlay();
    };
  
    const seek = async (millis) => {
      const seconds = Math.floor(millis / 1000) % 60;
      const minutes = Math.floor(millis / 1000 / 60);
      console.log('Skipping to time ' + (minutes) + ':' + seconds);
      return getPlayer().seek(millis);
    };
  
    // adds a list of songs to the context play queue.
    // context here means that they're added because of where the user is,
    // not because the user specifically requested. for example,
    // if you play a song in the middle of a playlist, the following songs
    // in the playlist should be added here.
    const addToContextPlayQueue = (songs) => {
      setContextPlayQueue([...contextPlayQueue, ...songs]);
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
      setContextPlayQueue([]);
    }
  
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
  
    const getUserPlayQueue = () => {
      return [...userPlayQueue];
    }
  
    const getContextPlayQueue = () => {
      return [...contextPlayQueue];
    }
  
    const deleteUserQueueSong = (index) => {
      console.log('Deleting index ' + index + ' from user queue');
      setUserPlayQueue([...userPlayQueue.slice(0, index), ...userPlayQueue.slice(index + 1)])
    }
  
    const deleteContextQueueSong = (index) => {
      console.log('Deleting index ' + index + ' from context queue');
      setContextPlayQueue([...contextPlayQueue.slice(0, index), ...contextPlayQueue.slice(index + 1)])
    }
  
    const setVolume = (volume) => {
      console.log('Setting volume to ' + volume + ' (' + Math.floor(volume * 100 + 0.5) + '%)');
      return getPlayer().setVolume(volume);
    }
  
    const getVolume = () => {
      return getPlayer().getVolume();
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
      setAutoplay: setAutoplay,
      isAutoplaying: () => autoplay,
      // volume controls
      setVolume: setVolume,
      getVolume: getVolume,
      isMuted: () => muted,
      setMuted: setMuted,
      // up next (queue) controls
      getUserPlayQueue: getUserPlayQueue,
      addToUserPlayQueue: addToUserPlayQueue,
      deleteUserQueueSong: deleteUserQueueSong,
      clearUserPlayQueue: clearUserPlayQueue,
      getContextPlayQueue: getContextPlayQueue,
      addToContextPlayQueue: addToContextPlayQueue,
      deleteContextQueueSong: deleteContextQueueSong,
      clearContextPlayQueue: clearContextPlayQueue,
      // various functions
      addStateListener: addStateListener,
      getPlayerState: () => playerState,
    };
  }
}
import { useContext, createContext, useState } from "react";
import { refreshSpotifyToken }  from './../api/authenticationApi';
import { playTrack } from './../api/spotifyApi'
import WebPlaybackReact from './WebPlaybackReact';

const sdkContext = createContext();

export function useSpotifySdk() {
  return useContext(sdkContext);
}

export function ProvideSpotify({ children }) {
  const [spotifyToken, setSpotifyToken] = useState(null);
  const [deviceId, setDeviceId] = useState(null);
  const [playerLoaded, setPlayerLoaded] = useState(false);
  const [playerSelected, setPlayerSelected] = useState(false);
  const [playerState, setPlayerState] = useState({});
  const [stateCallbacks, setStateCallbacks] = useState({});
  const [playerRef, setPlayerRef] = useState(null);

  const sdk = useProvideSdk(
    () => spotifyToken,
    setSpotifyToken,
    () => deviceId,
    (keyCallbackPairs) => {
      setStateCallbacks({...stateCallbacks, ...keyCallbackPairs})
      console.log('Registered callback(s): ' + Object.entries(keyCallbackPairs).map(entry => entry[0]).join(', '));
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
        const newToken = await refreshSpotifyToken();
        setSpotifyToken(newToken);
        return newToken;
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
      Object.entries(stateCallbacks).forEach(entry => {
        const cb = entry[1];
        cb(newState);
      })
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
}

function useProvideSdk(getAccessToken, setAccessToken, getDeviceId, addStateListener, getPlayer) {

  const refreshToken = async () => {
    return refreshSpotifyToken().then(result => {
      setAccessToken(result.access_token);
      return result.access_token;
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
      refreshToken().then(() => attempt());
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

  return {
    resume: refreshWrapper(() => {play()}),
    pause: refreshWrapper(pause),
    play: refreshWrapper(play),
    togglePlay: refreshWrapper(togglePlaying),
    seek: refreshWrapper(seek),
    addStateListener: addStateListener,
  };
}
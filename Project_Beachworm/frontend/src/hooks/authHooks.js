import { useContext, createContext, useState, useEffect, useCallback } from "react";
import { useHistory } from 'react-router-dom';
import { signIn as apiSignIn, refreshSpotifyToken }  from './../api/authenticationApi';
import { getCurrentUser, getUserSeeds }  from './../api/userApi';
import axiosInstance from './../api/axiosApi';

/* This code is largely adapted from https://reactrouter.com/web/example/auth-workflow
* `authContext`, `ProvideAuth`, `useAuth` and `useProvideAuth`
* refer to: https://usehooks.com/useAuth/
*/
const authContext = createContext();

export function ProvideAuth({ children }) {
  const auth = useProvideAuth();
  return (
    <authContext.Provider value={auth}>
      {children}
    </authContext.Provider>
  );
}

export function useAuth() {
  return useContext(authContext);
}

function useProvideAuth() {
  const [tokens, setTokens] = useState({ refresh: localStorage.getItem('refresh_token'), access: null });
  const [id, setId] = useState(null);
  const [spotifyToken, setSpotifyToken] = useState(null);
  const [hasSeeds, setHasSeeds] = useState({ artist: false, genre: false });
  const [isFullyLoaded, setIsFullyLoaded] = useState(false);
  const [hasAuthenticatedSpotify, setHasAuthenticatedSpotify] = useState(false);

  const history = useHistory();

  const signIn = (user, pass, cb) => {
    console.log('Attempting sign in for user ' + user);
    return apiSignIn(user, pass).then(result => {
      console.log('Sign in successful');
      axiosInstance.defaults.headers['Authorization'] = `JWT ${result.access}`;
      setTokens({ refresh: result.refresh, access: result.access });
      if (cb) {
        cb();
      }
      return user;
    });
  };

  const signOut = useCallback(cb => {
    localStorage.removeItem('refresh_token');
    delete axiosInstance.defaults.headers['Authorization'];
    setTokens({ refresh: null, access: null });
    setId(null);
    setSpotifyToken(null);
    setHasAuthenticatedSpotify(false);
    setIsFullyLoaded(false);
    setHasSeeds({ artist: false, genre: false });
    if (cb) {
      cb();
    }
    console.log('Signed out');
  }, []);

  useEffect(() => {
    const updateUser = async () => {
      if (tokens.refresh) {
        if (!tokens.access) {
          // if we have a refresh token but no access token, try to refresh one
          console.log('No access token stored. Attempting to retrieve with refresh token.');
          return axiosInstance.post('/token/refresh/', {refresh: tokens.refresh})
          .then(response => {
              console.log('Successfully retrieved access token.');
              const newRefresh = response.data.refresh;
              const newAccess = response.data.access;
              axiosInstance.defaults.headers['Authorization'] = "JWT " + newAccess;
              localStorage.setItem('refresh_token', newRefresh);
              setTokens({ refresh: newRefresh, access: newAccess, });
          }, () => {
            signOut();
            history.push('/');
          });
        } else {
          // if we have a refresh token and an access token
          console.log('New auth detected. Fetching current user details');
          await getCurrentUser().then(value => {
            setId(value.user_id);
            return Promise.resolve(value);
          }, (_reject) =>{
            console.log('Couldn\'t find curr user, not sure why. Forcing a sign out.');
            signOut();
          }).then(async _value => {
            // now attempt to set questionnaire status
            await getUserSeeds().then(value => {
              const numArtistSeeds = value.artists.length;
              const numGenreSeeds = value.genres.length;
              setHasSeeds({
                artist: numArtistSeeds > 0,
                genre: numGenreSeeds > 0,
              });
              console.log(`User has ${numArtistSeeds} artist seeds and ${numGenreSeeds} genre seeds.`);
            }, _reject => {
              console.log('Could not retrieve user seeds');
            });
          }).then(async _value => {
            console.log('Current user successfully pulled, attempting to get initial Spotify access token.');
            // have successful user, so should also have spotify token
            await refreshSpotifyAuth().then(() => {
              console.log('Spotify access token successfully retrieved.');
            }, () => {
              console.log('Failed to retrieve Spotify access token.');
              return Promise.resolve();
            });
          });

          setIsFullyLoaded(true);
        }
      }
    };

    updateUser();
  }, [history, signOut, tokens]);

  const refreshSpotifyAuth = () => {
    return refreshSpotifyToken().then(result => {
      if (result) {
        setSpotifyToken(result);
        setHasAuthenticatedSpotify(true);
        return Promise.resolve(result);
      } else {
        setHasAuthenticatedSpotify(false);
        return Promise.reject('No access token from endpoint');
      }
    }, _reject => {
      setHasAuthenticatedSpotify(false);
      console.log('Access token failed to refresh')
      return Promise.reject();
    });
  };

  return {
    id,
    tokens,
    signIn,
    signOut,
    refreshSpotifyAuth,
    spotifyToken,
    setSpotifyToken: (token) => {
      setSpotifyToken(token);
      setHasAuthenticatedSpotify(true);
    },
    setHasSeeds,
    isFullyLoaded,
    hasAuthenticatedSpotify,
    hasSeeds,
  };
}
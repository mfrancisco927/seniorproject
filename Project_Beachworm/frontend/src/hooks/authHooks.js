import { useContext, createContext, useState, useEffect } from "react";
import { signIn as apiSignIn, refreshSpotifyToken }  from './../api/authenticationApi';
import { getCurrentUser }  from './../api/userApi';

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
  const [user, setUser] = useState(localStorage.getItem('access_token'));
  const [id, setId] = useState(null);
  const [spotifyToken, setSpotifyToken] = useState(null);
  const [hasAuthenticatedSpotify, setHasAuthenticatedSpotify] = useState(null);

  useEffect(() => {
    const updateUser = async () => {
      if (user) {
        console.log('New auth detected. Fetching current user details');
        await getCurrentUser().then(value => {
          setId(value.user_id);
          return Promise.resolve(value);
        }).then(async _value => {
          console.log('Current user successfully pulled, attempting to get initial Spotify access token.');
          // have successful user, so should also have spotify token
          await refreshSpotifyAuth().then(() => {
            console.log('Spotify access token successfully retrieved.');
          }, () => {
            console.log('Failed to retrieve Spotify access token.');
          });
        });
      }
    };

    updateUser();
  }, [user]);

  const signIn = (user, pass, cb) => {
    console.log('attempting sign in');
    return apiSignIn(user, pass).then(result => {
      setUser(user);
      if (cb) {
        cb();
      }
      return user;
    });
  };

  const signOut = cb => {
    localStorage.removeItem('refresh_token');
    localStorage.removeItem('access_token');
    setUser(null);
    setSpotifyToken(null);
    setHasAuthenticatedSpotify(false);
    if (cb) {
      cb();
    }
  };

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
    });
  };

  return {
    user,
    id,
    signIn,
    signOut,
    refreshSpotifyAuth,
    spotifyToken,
    setSpotifyToken,
    hasAuthenticatedSpotify,
  };
}
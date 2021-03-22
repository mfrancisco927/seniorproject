import { useEffect } from 'react';
import { useHistory } from 'react-router-dom';
import { storeSpotifyAuth, refreshSpotifyToken } from './../../api/authenticationApi';
import { useLocation } from 'react-router-dom';
import { useAuth } from './../../hooks/authHooks';

const SpotifyAuth = () => {
  const auth = useAuth();
  const location = useLocation();
  const history = useHistory();
  const { redirect } = history.location.state || {};
  const REDIRECT_STORAGE_ITEM_TAG = 'spotify-auth-redirect';

  const spotifyEndpoint = 'https://accounts.spotify.com/authorize';
  const clientId = 'e60a380058324c33bb56c0067ca0a325';
  const localAccessToken = localStorage.getItem('access_token');
  const redirectUri = 'http://localhost:3000/spotify-auth';
  const scopes = ["streaming", "user-read-playback-state", "user-modify-playback-state"]
  const scopes_encoded = scopes.join("%20");

  const spotifyAuthLink = `
    ${spotifyEndpoint}?client_id=${clientId}&response_type=code&scope=${scopes_encoded}&redirect_uri=${redirectUri}&state=${localAccessToken}
  `;

  // on page load, if we have a code, try to store and redeem it
  useEffect(() => {
    const query = new URLSearchParams(location.search);
    const code = query.get('code');
    const state = query.get('state');

    // prioritize attempting spotify auth
    if (code && state === localAccessToken && !auth.hasAuthenticatedSpotify) {
      storeSpotifyAuth(code, state).then(result => {
        auth.setSpotifyToken(result.access_token);
      }, _reject => {
        // do nothing on reject, just to avoid errors
        console.log('Failed to store spotify token!');
      });
    } else if (redirect) {
      // store our redirect in local storage, since we'll lose state on the spotify page redirect=
      localStorage.setItem(REDIRECT_STORAGE_ITEM_TAG, redirect);
    }
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  // if we're authenticated and have somewhere to redirect, redirect the user there
  useEffect(() => {
    const redirectTarget = localStorage.getItem(REDIRECT_STORAGE_ITEM_TAG);
    if (auth.hasAuthenticatedSpotify && redirectTarget) {
      console.log('Redirecting user to previous page');
      history.push(redirectTarget);
      localStorage.removeItem(REDIRECT_STORAGE_ITEM_TAG);
    }
  }, [auth.hasAuthenticatedSpotify, history])

  const refresh = () => {
    refreshSpotifyToken().then(async result => {
      await auth.refreshSpotifyAuth();
    }, reject => {
      // do nothing on reject
    });
  }

  return (
    <div>
      <a href={spotifyAuthLink}>
        <button>
          Authorize
        </button>
      </a>
      {auth.spotifyToken && (
        <div>
          <h2>Spotify Authorization</h2>
          <p>You might already have a token!</p>
          <p>Found token: {auth.spotifyToken}</p>
          <button onClick={refresh}>Refresh token</button>
        </div>
      )}
    </div>
  );
}

export default SpotifyAuth;
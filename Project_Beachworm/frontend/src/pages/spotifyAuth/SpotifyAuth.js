import { useCallback, useEffect, useState } from 'react';
import { useHistory } from 'react-router-dom';
import { storeSpotifyAuth, refreshSpotifyToken } from './../../api/authenticationApi';
import { useLocation } from 'react-router-dom';
import { useAuth } from './../../hooks/authHooks';

import { withStyles } from '@material-ui/core/styles';
import Button from '@material-ui/core/Button';
import { green } from '@material-ui/core/colors';

import './SpotifyAuth.css';

const SpotifyAuth = () => {
  const [error, setError] = useState(false);
  const auth = useAuth();
  const location = useLocation();
  const history = useHistory();
  const { redirect } = history.location.state || {};
  const REDIRECT_STORAGE_ITEM_TAG = 'spotify-auth-redirect';

  const spotifyEndpoint = 'https://accounts.spotify.com/authorize';
  const clientId = 'e60a380058324c33bb56c0067ca0a325';
  const redirectUri = 'http://localhost:3000/spotify-auth';
  const scopes = ["streaming", "user-read-playback-state", "user-modify-playback-state"]
  const scopes_encoded = scopes.join("%20");

  const spotifyAuthLink = `
    ${spotifyEndpoint}?client_id=${clientId}&response_type=code&scope=${scopes_encoded}&redirect_uri=${redirectUri}&state=${auth.id}
  `;
  
  const redirectTarget = redirect || localStorage.getItem(REDIRECT_STORAGE_ITEM_TAG);

  const redirectToProperLocation = useCallback(() => {
    if (redirectTarget) {
      console.log('Redirecting user to previous page at ' + redirectTarget);
      history.push(redirectTarget);
      localStorage.removeItem(REDIRECT_STORAGE_ITEM_TAG);
    }
  }, [history, redirectTarget]);

  // on page load, if we have a code, try to store and redeem it
  useEffect(() => {
    const query = new URLSearchParams(location.search);
    const code = query.get('code');
    const state = query.get('state');
    const error = query.get('error');

    // prioritize attempting spotify auth
    if (!error && code && Number(state) === auth.id && !auth.hasAuthenticatedSpotify) {
      console.log('Attempting to store spotify auth token.');
      storeSpotifyAuth(code, state).then(result => {
        auth.setSpotifyToken(result.access_token);
        redirectToProperLocation();
      }, _reject => {
        // do nothing on reject, just to avoid errors
        console.log('Failed to store spotify token!');
      });
      setError(false);
    } else if (error) {
      setError(true);
    } else if (redirect) {
      // store our redirect in local storage, since we'll lose state on the spotify page redirect
      if (!auth.hasAuthenticatedSpotify) {
        localStorage.setItem(REDIRECT_STORAGE_ITEM_TAG, redirect);
      } else {
        redirectToProperLocation();
      }
    }
  }, [auth, history, location.search, redirect, redirectToProperLocation]);


  const refresh = () => {
    refreshSpotifyToken().then(async result => {
      await auth.refreshSpotifyAuth();
    }, reject => {
      // do nothing on reject
    });
  }

  const ColorButton = withStyles((theme) => ({
    root: {
      color: theme.palette.getContrastText(green[500]),
      backgroundColor: green[500],
      '&:hover': {
        backgroundColor: green[700],
      },
    },
  }))(Button);

  const showDevInfo = false;

  return (
    <div className="spotify-auth_wrapper">
      <h2 className="spotify-auth_header">You need a Spotify Premium account to use the full website.</h2>
      <a href={spotifyAuthLink}>
        <ColorButton className="spotify-auth_btn" variant="contained" color="primary">
          <span className="spotify-auth_btn-text">
            Press here to authorize through Spotify!
          </span>
        </ColorButton>
      </a>
      {auth.hasAuthenticatedSpotify && (
        <h2 className="spotify-auth_success-header">
          You're authenticated. Enjoy BeachWorm!
        </h2>
      )}
      {error && (
        <h2 className="spotify-auth_failure-header">
          Uh oh, something went wrong. Please try to authenticate again.
        </h2>
      )}
      {showDevInfo && (
        <div>
          {auth.spotifyToken && (
            <p>Found token: {auth.spotifyToken}</p>
          )}
          <button onClick={refresh}>Refresh token</button>
        </div>
      )}
    </div>
  );
}

export default SpotifyAuth;
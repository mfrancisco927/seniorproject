// import { useAuth } from './../../hooks/authHooks';
import { useEffect, useState } from 'react';
import { useHistory } from 'react-router-dom';
import { storeSpotifyAuth, refreshSpotifyToken } from './../../api/authenticationApi';
import { useLocation } from 'react-router-dom';

const SpotifyAuth = () => {
  const location = useLocation();
  const history = useHistory();

  const [spotifyToken, setSpotifyToken] = useState(localStorage.getItem('spotify_access_token'));

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

    if (code && state === localAccessToken) {
      storeSpotifyAuth(code, state).then(result => {
        localStorage.setItem('spotify_access_token', result.access_token);
        setSpotifyToken(result.access_token);
        history.push('/');
      }, reject => {
        // do nothing on reject
      });
    }
  }, []);

  const refresh = () => {
    refreshSpotifyToken().then(result => {
      localStorage.setItem('spotify_access_token', result.access_token);
      setSpotifyToken(result.access_token);
    }, reject => {
      // do nothing on reject
    });
  }

  const clear = () => {
    localStorage.removeItem('spotify_access_token');
    setSpotifyToken(localStorage.getItem('spotify_access_token'))
  }

  return (
    <div>
      <a href={spotifyAuthLink}>
        <button>
          Authorize
        </button>
      </a>
      {spotifyToken && (
        <div>
          <h2>Spotify Authorization</h2>
          <p>You might already have a token!</p>
          <p>Found token: {spotifyToken}</p>
          <button onClick={refresh}>Refresh token</button>
          <button onClick={clear}>Clear token</button>
        </div>
      )}
    </div>
  );
}

export default SpotifyAuth;
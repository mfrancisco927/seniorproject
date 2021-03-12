// import { useAuth } from './../../hooks/authHooks';
import { useState } from 'react';
import { storeSpotifyAuth, refreshSpotifyToken } from './../../api/authenticationApi';
import { useLocation } from 'react-router-dom';

const SpotifyAuth = () => {
  const query = new URLSearchParams(useLocation().search);
  const code = query.get('code');
  const state = query.get('state');

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

  const store = () => {
    storeSpotifyAuth(code, state).then(result => {
      localStorage.setItem('spotify_access_token', result.access_token);
      setSpotifyToken(result.access_token);
    });
  };

  const refresh = () => {
    refreshSpotifyToken().then(result => {
      localStorage.setItem('spotify_access_token', result.access_token);
      setSpotifyToken(result.access_token);
    })
  }

  const clear = () => {
    localStorage.removeItem('spotify_access_token');
    setSpotifyToken(localStorage.getItem('spotify_access_token'))
  }

  return (
    <div>
      <a href={spotifyAuthLink}>Authorize v2</a>
      {!spotifyToken && code && state === localAccessToken && <button onClick={store}>Press this button to create credentials!</button>}
      {spotifyToken && (
        <div>
          <p>Spotify access token: {spotifyToken}</p>
          <button onClick={refresh}>Refresh token</button>
          <button onClick={clear}>Clear token</button>
        </div>
      )}
    </div>
  );
}

export default SpotifyAuth;
import axiosInstance from './axiosApi';

const baseUri = '/auth';
const spotifyEndpointUri = (userId) => baseUri + '/spotify-tokens/users/' + userId + '/';

// note, token endpoints do not use the /auth/ base
const tokenBaseUri = '/token/';
const acquireTokenUri = tokenBaseUri + 'obtain/';
const refreshTokenUri = tokenBaseUri + 'refresh/'; // currently handled in axiosApi, no need to duplicate

// directly from https://hackernoon.com/110percent-complete-jwt-authentication-with-django-and-react-2020-iejq34ta
export async function signIn(username, password) {
  const acquireTokenEndpoint = acquireTokenUri;
  let success = false;

  const response = await axiosInstance.post(acquireTokenEndpoint, {
    username: username,
    password: password,
  }).then(response => {
    if (response) {
      success = true;
      axiosInstance.defaults.headers['Authorization'] = "JWT " + response.data.access;
      localStorage.setItem('access_token', response.data.access);
      localStorage.setItem('refresh_token', response.data.refresh);
      return response.data;
    }
  }).catch(error => {
    success = false;
  });

  if (!success) {
    throw new Error('Sign in request failed');
  }

  return response;
}

export async function refreshToken() {
  const refreshTokenEndpoint = refreshTokenUri;
  let success = false;

  const currentRefreshToken = localStorage.getItem('refresh_token');

  const response = await axiosInstance.post(refreshTokenEndpoint, {refresh: currentRefreshToken})
    .then(response => {
      if (response) {
        success = true;
        localStorage.setItem('access_token', response.data.access);
        localStorage.setItem('refresh_token', response.data.refresh);

        axiosInstance.defaults.headers['Authorization'] = "JWT " + response.data.access;
      }
      return response.data;
    }).catch(error => {
      success = false;
    }
  );

  if (!success) {
    throw new Error('Refresh request failed');
  }

  return response;
}

export async function getSpotifyToken(userId) {
  const spotifyEndpoint = spotifyEndpointUri(userId);
  const response = await axiosInstance.get(spotifyEndpoint);
  return response.data;
}

export async function addSpotifyRefreshToken(userId, refreshToken) {
  const spotifyEndpoint = spotifyEndpointUri(userId);
  const response = await axiosInstance.post(spotifyEndpoint, {
    refreshToken: refreshToken,
  });
  return response.data;
}
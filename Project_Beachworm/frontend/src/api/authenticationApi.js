import axiosInstance from './axiosApi';

const baseUri = '/auth';
const spotifyEndpointUri = (userId) => baseUri + '/spotify-tokens/users/' + userId + '/';

// note, token endpoints do not use the /auth/ base
const tokenBaseUri = '/token/';
const acquireTokenUri = tokenBaseUri + 'obtain/';
// const refreshTokenUri = tokenBaseUri + 'refresh/'; // currently handled in axiosApi, no need to duplicate

// directly from https://hackernoon.com/110percent-complete-jwt-authentication-with-django-and-react-2020-iejq34ta
async function signIn(username, password) {
  const acquireTokenEndpoint = acquireTokenUri;
  try {
    const data = await axiosInstance.post(acquireTokenEndpoint, {
      username: username,
      password: password,
    });
    axiosInstance.defaults.headers['Authorization'] = "JWT " + data.access;
    localStorage.setItem('access_token', data.access);
    localStorage.setItem('refresh_token', data.refresh);
    return data;
  } catch (error) {
    console.log(error.stack);
    throw error;
  }
}

async function getSpotifyToken(userId) {
  const spotifyEndpoint = spotifyEndpointUri(userId);
  try {
    const response = await axiosInstance.get(spotifyEndpoint);
    return response.data;
  } catch (error) {
    console.log(error.stack);
    throw error;
  }
}

async function addSpotifyRefreshToken(userId, refreshToken) {
  const spotifyEndpoint = spotifyEndpointUri(userId);
  try {
    const response = await axiosInstance.post(spotifyEndpoint, {
      refreshToken: refreshToken
    });
    return response.data;
  } catch (error) {
    console.log(error.stack);
    throw error;
  }
}
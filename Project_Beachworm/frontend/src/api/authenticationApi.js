import axiosInstance from './axiosApi';

const baseUri = '/auth';
const loginTokenEndpointUri = baseUri + '/user/login';
const spotifyEndpointUri = (userId) => baseUri + '/user/spotify-tokens/users/' + userId;

// directly from https://hackernoon.com/110percent-complete-jwt-authentication-with-django-and-react-2020-iejq34ta
async function signIn(username, password) {
  const signInEndpoint = loginTokenEndpointUri;
  try {
    const data = await axiosInstance.post(signInEndpoint, {
      username: this.state.username,
      password: this.state.password,
    });
    axiosInstance.defaults.headers['Authorization'] = "JWT " + data.access;
    localStorage.setItem('access_token', data.access);
    localStorage.setItem('refresh_token', data.refresh);
    return data;
  } catch (error) {
    throw error;
  }
}

async function getSpotifyToken(userId) {
  const spotifyEndpoint = spotifyEndpointUri(userId);
  try {
    const response = await axiosInstance.get(spotifyEndpoint);
    return response.data;
  } catch (error) {
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
    throw error;
  }
}
import axiosInstance from './axiosApi';

// note, token endpoints do not use the /auth/ base
const tokenBaseUri = '/token/';
const acquireTokenUri = tokenBaseUri + 'obtain/';
const refreshTokenUri = tokenBaseUri + 'refresh/'; // currently handled in axiosApi, no need to duplicate

// spotify endpoints
const spotifyBaseUri = '/spotify/';
// const spotifyGetAuthUri = spotifyBaseUri + 'get-auth/'
const spotifyRefreshTokenUri = spotifyBaseUri + 'refresh-token/'
const spotifyStoreTokenUri = spotifyBaseUri + 'store-credential/'

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

export async function getSpotifyToken() {
  const spotifyAccessTokenEndpoint = spotifyRefreshTokenUri;
  const response = await axiosInstance.get(spotifyAccessTokenEndpoint);
  return response.data;
}

// export async function initiateSpotifyAuth() {
//   const spotifyAuthEndpoint = spotifyGetAuthUri;
//   const response = await axiosInstance.get(spotifyAuthEndpoint).then(result => {
//     console.log(result);
//   });
//   console.log(response);
//   return response.data;
// }

export async function storeSpotifyAuth(code, state) {
  const spotifyStoreEndpoint = spotifyStoreTokenUri;
  const response = await axiosInstance.post(spotifyStoreEndpoint, {
    code: code,
    state: state
  });
  return response.data;
}

export async function refreshSpotifyToken() {
  const spotifyRefreshEndpoint = spotifyRefreshTokenUri;
  const response = await axiosInstance.get(spotifyRefreshEndpoint).then(result => {
    localStorage.setItem('spotify_access_token', result.data.access_token);
    return result;
  });
  return response.data;
}
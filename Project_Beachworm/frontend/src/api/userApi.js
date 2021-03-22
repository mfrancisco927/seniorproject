import axiosInstance from './axiosApi';

const baseUri = '/user/';
const baseUri2 = '/users/';
const currentUserEndpointUri = baseUri + 'current/';
const userEndpointUri = (userId) => baseUri + userId + '/';
const playlistEndpointUri = (userId) => baseUri + userId + '/playlists/';
const registerEndpointUri = baseUri + 'create/';
const profileEndpointUri = (userId) => baseUri2 + userId + '/profile/';
const followingEndpointUri = (targetUid) => baseUri2 + 'profile/following/' + targetUid + '/';

export async function getCurrentUser() {
  const currentUserEndpoint = currentUserEndpointUri;
  const response = await axiosInstance.get(currentUserEndpoint);
  return response.data;
}

export async function getUser(userId) {
  const userEndpoint = userEndpointUri(userId);
  const response = await axiosInstance.get(userEndpoint);
  return response.data;
}

export async function getPlaylists(userId) {
  const playlistEndpoint = playlistEndpointUri(userId);
  const response = await axiosInstance.get(playlistEndpoint);
  return response.data;
}

export async function createPlaylist(userId, title, isPublic=true) {
  const playlistEndpoint = playlistEndpointUri(userId);
  // config is THIRD argument in post, so pass in empty object for data
  const response = await axiosInstance.post(playlistEndpoint, {}, {
    params: {
      title: title,
      is_public: isPublic,
    }
  });
  return response.data;
}

export async function createUser(email, username, password) {
  const response = await axiosInstance.post(registerEndpointUri, {
    email: email,
    username: username,
    password: password,
  });
  return response.data;
}

export async function getProfile(userId) {
  const profileEndpoint = profileEndpointUri(userId);
  return await axiosInstance.get(profileEndpoint).then(value => {
    return Promise.resolve(value.data);
  }, reason => {
    return Promise.reject(reason);
  });
}

export async function followUser(targetUserId) {
  const profileEndpoint = followingEndpointUri(targetUserId);
  const response = await axiosInstance.post(profileEndpoint);
  return response.data;
}

export async function unfollowUser(targetUserId) {
  const profileEndpoint = followingEndpointUri(targetUserId);
  const response = await axiosInstance.delete(profileEndpoint);
  return response.data;
}

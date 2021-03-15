import axiosInstance from './axiosApi';

const baseUri = '/user/';
const currentUserEndpointUri = baseUri + 'current/';
const userEndpointUri = (userId) => baseUri + userId + '/';
const playlistEndpointUri = (userId) => baseUri + userId + '/playlists/';
const registerEndpointUri = baseUri + 'create/';
const profileEndpointUri = (userId) => baseUri + userId + '/profile/';
const followingEndpointUri = (userId, targetUid) => profileEndpointUri(userId) + '/following/' + targetUid + '/';
const genreSeedEndpointUri = (userId) => profileEndpointUri(userId) + '/seeds/genres/';
const artistSeedEndpointUri = (userId) => profileEndpointUri(userId) + '/seeds/artists/';

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

export async function createPlaylist(userId, songIds) {
  const playlistEndpoint = playlistEndpointUri(userId);
  const response = await axiosInstance.post(playlistEndpoint, {
    songIds: songIds,
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
  const response = await axiosInstance.get(profileEndpoint);
  return response.data;
}

export async function followUser(userId, targetUserId) {
  const profileEndpoint = followingEndpointUri(userId, targetUserId);
  const response = await axiosInstance.get(profileEndpoint);
  return response.data;
}

export async function unfollowUser(userId, targetUserId) {
  const profileEndpoint = followingEndpointUri(userId, targetUserId);
  const response = await axiosInstance.delete(profileEndpoint);
  return response.data;
}

export async function addGenreSeeds(userId, genreIds) {
  const genreSeedEndpoint = genreSeedEndpointUri(userId);
  const response = await axiosInstance.post(genreSeedEndpoint, {
    ids: genreIds,
  });
  return response.data;
}

export async function addArtistSeeds(userId, artistIds) {
  const artistSeedEndpoint = artistSeedEndpointUri(userId);
  const response = await axiosInstance.post(artistSeedEndpoint, {
    ids: artistIds,
  });
  return response.data;
}
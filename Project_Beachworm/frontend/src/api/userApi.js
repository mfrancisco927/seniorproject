import axiosInstance from './axiosApi';

const baseUri = '/users/';
const userEndpointUri = (userId) => baseUri + userId;
const playlistEndpointUri = (userId) => baseUri + userId + '/playlists';
const registerEndpointUri = baseUri + 'create';
const profileEndpointUri = (userId) => baseUri + userId + '/profile';
const followingEndpointUri = (userId, targetUid) => profileEndpointUri(userId) + '/following/' + targetUid;
const genreSeedEndpointUri = (userId) => profileEndpointUri(userId) + '/seeds/genres';
const artistSeedEndpointUri = (userId) => profileEndpointUri(userId) + '/seeds/artists';

async function getUser(userId) {
  const userEndpoint = userEndpointUri(userId);
  try {
    const response = await axiosInstance.get(userEndpoint);
    return response.data;
  } catch (error) {
      console.log(error.stack);
  }
}

async function getPlaylists(userId) {
  const playlistEndpoint = playlistEndpointUri(userId);
  try {
    const response = await axiosInstance.get(playlistEndpoint);
    return response.data;
  } catch (error) {
      console.log(error.stack);
  }
}

async function createPlaylist(userId, songIds) {
  const playlistEndpoint = playlistEndpointUri(userId);
  try {
    const response = await axiosInstance.post(playlistEndpoint, {
      songIds: songIds,
    });
    return response.data;
  } catch (error) {
      console.log(error.stack);
  }
}

async function createUser(email, username, password) {
  try {
    const response = await axiosInstance.post(registerEndpointUri, {
      email: email,
      username: username,
      password: password,
    });
    return response.data;
  } catch (error) {
      console.log(error.stack);
  }
}

async function getProfile(userId) {
  const profileEndpoint = profileEndpointUri(userId);
  try {
    const response = await axiosInstance.get(profileEndpoint);
    return response.data;
  } catch (error) {
      console.log(error.stack);
  }
}

async function followUser(userId, targetUserId) {
  const profileEndpoint = followingEndpointUri(userId, targetUserId);
  try {
    const response = await axiosInstance.get(profileEndpoint);
    return response.data;
  } catch (error) {
      console.log(error.stack);
  }
}

async function unfollowUser(userId, targetUserId) {
  const profileEndpoint = followingEndpointUri(userId, targetUserId);
  try {
    const response = await axiosInstance.delete(profileEndpoint);
    return response.data;
  } catch (error) {
      console.log(error.stack);
  }
}

async function addGenreSeeds(userId, genreIds) {
  const genreSeedEndpoint = genreSeedEndpointUri(userId);
  try {
    const response = await axiosInstance.post(genreSeedEndpoint, {
      ids: genreIds 
    });
    return response.data;
  } catch (error) {
      console.log(error.stack);
  }
}

async function addArtistSeeds(userId, artistIds) {
  const artistSeedEndpoint = artistSeedEndpointUri(userId);
  try {
    const response = await axiosInstance.post(artistSeedEndpoint, {
      ids: artistIds 
    });
    return response.data;
  } catch (error) {
      console.log(error.stack);
  }
}
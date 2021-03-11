import axiosInstance from './axiosApi';

const baseUri = '/recommendations';
const standardRecommendationUri = (userId) => baseUri + '/user/' + userId + '/';
const genreRecommendationUri = (genreId) => baseUri + '/genre/' + genreId + '/';
const artistRecommendationUri = (artistId) => baseUri + '/artist/' + artistId + '/';
const playlistRecommendationUri = (playlistId) => baseUri + '/playlists/' + playlistId + '/';

export async function getRecommendations(userId) {
  const recEndpoint = standardRecommendationUri(userId);
  try {
    const response = await axiosInstance.get(recEndpoint);
    return response.data;
  } catch (error) {
  throw error;
  }
}

export async function getRecommendationsByArtist(artistId) {
  const artistRecEndpoint = artistRecommendationUri(artistId);
  try {
    const response = await axiosInstance.get(artistRecEndpoint);
    return response.data;
  } catch (error) {
  throw error;
  }
}

export async function getRecommendationsByGenre(genreId) {
  const genreRecEndpoint = genreRecommendationUri(genreId);
  try {
    const response = await axiosInstance.get(genreRecEndpoint);
    return response.data;
  } catch (error) {
  throw error;
  }
}

export async function getRecommendationsByPlaylist(playlistId) {
  const playlistRecEndpoint = playlistRecommendationUri(playlistId);
  try {
    const response = await axiosInstance.get(playlistRecEndpoint);
    return response.data;
  } catch (error) {
  throw error;
  }
}
import axiosInstance from './axiosApi';

const baseUri = '/recommendations';
const standardRecommendationUri = (userId) => baseUri + '/user/' + userId + '/';
const genreRecommendationUri = (genreId) => baseUri + '/genre/' + genreId + '/';
const artistRecommendationUri = (artistId) => baseUri + '/artist/' + artistId + '/';
const playlistRecommendationUri = (playlistId) => baseUri + '/playlists/' + playlistId + '/';

export async function getRecommendations(userId) {
  const recEndpoint = standardRecommendationUri(userId);
  const response = await axiosInstance.get(recEndpoint);
  return response.data;
}

export async function getRecommendationsByArtist(artistId) {
  const artistRecEndpoint = artistRecommendationUri(artistId);
  const response = await axiosInstance.get(artistRecEndpoint);
  return response.data;
}

export async function getRecommendationsByGenre(genreId) {
  const genreRecEndpoint = genreRecommendationUri(genreId);
  const response = await axiosInstance.get(genreRecEndpoint);
  return response.data;
}

export async function getRecommendationsByPlaylist(playlistId) {
  const playlistRecEndpoint = playlistRecommendationUri(playlistId);
  const response = await axiosInstance.get(playlistRecEndpoint);
  return response.data;
}
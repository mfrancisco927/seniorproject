import axiosInstance from './axiosApi';

const baseUri = '/recommendation';
const standardRecommendationUri = baseUri + '/user/';
const genreRecommendationUri = baseUri + '/genre/';
const artistRecommendationUri = baseUri + '/artist/';
const playlistRecommendationUri = baseUri + '/playlist/';
const obtainartistsUri = baseUri + '/obtain-artists/';
const sendGenreSeedsUri = '/user/profile/seed/genres/';

export async function getRecommendations() {
  const recEndpoint = standardRecommendationUri;
  const response = await axiosInstance.get(recEndpoint).then(x => {
    return Promise.resolve(x.data)
  }, error => {;
    return Promise.reject(error)
  });

  return response;
}

export async function getRecommendationsByArtist(artistId) {
  const artistRecEndpoint = artistRecommendationUri;
  const response = await axiosInstance.get(artistRecEndpoint, {
    params: {
      artist: artistId,
    }
  }).then(x => {
    return Promise.resolve(x.data)
  }, error => {;
    return Promise.reject(error)
  });

  return response;
}

export async function getRecommendationsByGenre(genreId) {
  const genreRecEndpoint = genreRecommendationUri;
  const response = await axiosInstance.get(genreRecEndpoint, {
    params: {
      genre: genreId,
    }
  }).then(x => {
    return Promise.resolve(x.data)
  }, error => {;
    return Promise.reject(error)
  });

  return response;
}

export async function postGenreSeeds(genreIds) {
  const sendGenreSeedsEndpoint = sendGenreSeedsUri;
  const response = await axiosInstance.post(sendGenreSeedsEndpoint, {
      genres: genreIds,
  });
  return response.data;
}

export async function obtainArtists() {
  const obtainArtistsEndpoint = obtainartistsUri;
  const response = await axiosInstance.get(obtainArtistsEndpoint, {
  }).then(x => {
    return Promise.resolve(x.data)
  }, error => {;
    return Promise.reject(error)
  });

  return response;
}

export async function getRecommendationsByPlaylist(playlistId) {
  const playlistRecEndpoint = playlistRecommendationUri;
  const response = await axiosInstance.get(playlistRecEndpoint, {
    params: {
      playlist: playlistId,
    }
  }).then(x => {
    return Promise.resolve(x.data)
  }, error => {;
    return Promise.reject(error)
  });

  return response;
}
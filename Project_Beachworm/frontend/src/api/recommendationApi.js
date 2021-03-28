import axiosInstance from './axiosApi';

const baseUri = '/recommendation';
const standardRecommendationUri = baseUri + '/user/';
const homeRecommendationUri = baseUri + '/home/';
const genreRecommendationUri = baseUri + '/genre/';
const artistRecommendationUri = baseUri + '/artist/';
const playlistRecommendationUri = baseUri + '/playlist/';
const songRecommendationUri = baseUri + '/song/';
const albumRecommendationUri = baseUri + '/album/';
const obtainartistsUri = baseUri + '/obtain-artists/';
const sendGenreSeedsUri = '/user/profile/seed/genres/';
const sendArtistSeedsUri = '/user/profile/seed/artists/';

export async function getRecommendations() {
  const recEndpoint = standardRecommendationUri;
  return await axiosInstance.get(recEndpoint).then(x => {
    return Promise.resolve(x.data)
  }, error => {;
    return Promise.reject(error)
  });
}

export async function getHomeRecommendations() {
  const recEndpoint = homeRecommendationUri;
  return await axiosInstance.get(recEndpoint).then(x => {
    return Promise.resolve(x.data)
  }, error => {;
    return Promise.reject(error)
  });
}

export async function getRecommendationsByArtist(artistId) {
  const artistRecEndpoint = artistRecommendationUri;
  return await axiosInstance.get(artistRecEndpoint, {
    params: {
      artist: artistId,
    }
  }).then(x => {
    return Promise.resolve(x.data)
  }, error => {;
    return Promise.reject(error)
  });
}

export async function getRecommendationsByGenre(genreId) {
  const genreRecEndpoint = genreRecommendationUri;
  return await axiosInstance.get(genreRecEndpoint, {
    params: {
      genre: genreId,
    }
  }).then(x => {
    return Promise.resolve(x.data)
  }, error => {;
    return Promise.reject(error)
  });
}

export async function getRecommendationsBySong(songId) {
  return await axiosInstance.get(songRecommendationUri, {
    params: {
      song: songId,
    }
  }).then(x => {
    return Promise.resolve(x.data)
  }, error => {;
    return Promise.reject(error)
  });
}

export async function getRecommendationsByAlbum(albumId) {
  return await axiosInstance.get(albumRecommendationUri, {
    params: {
      album: albumId,
    }
  }).then(x => {
    return Promise.resolve(x.data)
  }, error => {;
    return Promise.reject(error)
  });
}

export async function postGenreSeeds(genreIds) {
  const formData = new FormData()
  for (let x of genreIds) {
    formData.append('genres[]', x)
  }
  const sendGenreSeedsEndpoint = sendGenreSeedsUri;
  const response = await axiosInstance.post(sendGenreSeedsEndpoint, formData);
  return response.data;
}

export async function postArtistSeeds(artistIds) {
  const formData = new FormData()
  for (let x of artistIds) {
    formData.append('artists[]', x)
  }

  const sendArtistSeedsEndpoint = sendArtistSeedsUri;
  const response = await axiosInstance.post(sendArtistSeedsEndpoint, formData);
  return response.data;
}

export async function obtainArtists() {
  const obtainArtistsEndpoint = obtainartistsUri;
  return await axiosInstance.get(obtainArtistsEndpoint, {
  }).then(x => {
    return Promise.resolve(x.data)
  }, error => {;
    return Promise.reject(error)
  });
}

export async function getRecommendationsByPlaylist(playlistId) {
  const playlistRecEndpoint = playlistRecommendationUri;
  return await axiosInstance.get(playlistRecEndpoint, {
    params: {
      playlist: playlistId,
    }
  }).then(x => {
    return Promise.resolve(x.data)
  }, error => {;
    return Promise.reject(error)
  });
}
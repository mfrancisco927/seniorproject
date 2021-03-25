import axiosInstance from './axiosApi';

const baseUri = '/playlists';

const playlistSongs = (playlistId) => baseUri + '/' + playlistId + '/songs/';
const playlistPostSong = (playlistId, songId) => baseUri + '/' + playlistId + '/songs?id=' + songId + '/';
const playlistDeleteSong = (playlistId, songId) => baseUri + '/' + playlistId + '/' + songId + '/';
const playlistPutSettings = (playlistId) => baseUri + '/' + playlistId + '/';
const playlistDeletePlaylist = (playlistId) => baseUri + '/' + playlistId + '/';
const playlistFollowPlaylist = (playlistId, userId) => '/users' + '/' + userId + '/followed-playlist/' + playlistId + '/';
const playlistUnfollowPlaylist = (playlistId, userId) => '/users' + '/' + userId + '/followed-playlist/' + playlistId + '/';


export async function getPlaylistSongs(playlistId) {
  const recEndpoint = playlistSongs(playlistId);
  const response = await axiosInstance.get(recEndpoint).then( (resp) => {
    return Promise.resolve(resp.data);
  }, (error) =>{
    return Promise.reject(error)
  })
  return response.data;
}

export async function addSongToPlaylist(playlistId, songId) {
  const recEndpoint = playlistPostSong(playlistId, songId);
  const response = await axiosInstance.post(recEndpoint).then( (resp) => {
    return Promise.resolve(resp.data);
  }, (error) =>{
    return Promise.reject(error)
  })
  return response.data;
}

export async function deleteSongFromPlaylist(playlistId, songId) {
  const recEndpoint = playlistDeleteSong(playlistId, songId)
  const response = await axiosInstance.delete(recEndpoint).then( (resp) => {
    return Promise.resolve(resp.data);
  }, (error) =>{
    return Promise.reject(error)
  })
  return response.data;
}
  
export async function updatePlaylistSettings(playlistId) {
  const recEndpoint = playlistPutSettings(playlistId)
  const response = await axiosInstance.put(recEndpoint).then( (resp) => {
    return Promise.resolve(resp.data);
  }, (error) =>{
    return Promise.reject(error)
  })
  return response.data;
}

export async function deletePlaylist(playlistId) {
  const recEndpoint = playlistDeletePlaylist(playlistId)
  const response = await axiosInstance.delete(recEndpoint).then( (resp) => {
    return Promise.resolve(resp.data);
  }, (error) =>{
    return Promise.reject(error)
  })
  return response.data;
}

export async function followPlaylist(playlistId, userId) {
    const recEndpoint = playlistFollowPlaylist(playlistId, userId)
    const response = await axiosInstance.post(recEndpoint).then( (resp) => {
      return Promise.resolve(resp.data);
    }, (error) =>{
      return Promise.reject(error)
    })
    return response.data;
}

export async function unfollowPlaylist(playlistId, userId) {
    const recEndpoint = playlistUnfollowPlaylist(playlistId, userId);
    const response = await axiosInstance.put(recEndpoint).then( (resp) => {
      return Promise.resolve(resp.data);
    }, (error) =>{
      return Promise.reject(error)
    })
    return response.data;
}

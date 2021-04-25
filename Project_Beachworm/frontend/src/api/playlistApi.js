import axiosInstance from './axiosApi';

const baseUri = '/playlists';

const playlistSongs = (playlistId) => baseUri + '/' + playlistId + '/songs/';
const playlistDeleteSong = (playlistId, songId) => baseUri + '/' + playlistId + '/songs/';
const playlistPutSettings = (playlistId) => baseUri + '/' + playlistId + '/';
const playlistDeletePlaylist = (playlistId) => baseUri + '/' + playlistId + '/';
const playlistFollowPlaylist = (playlistId, userId) => '/users/' + userId + '/followed-playlists/' + playlistId + '/';
const playlistUnfollowPlaylist = (playlistId, userId) => '/users/' + userId + '/followed-playlists/' + playlistId + '/';
const playlistImageEndpoint = (playlistId) => baseUri + '/' + playlistId + '/image/';
const playlistCopyEndpoint = (targetId) => baseUri + '/copy/' + targetId + '/';

export async function getPlaylistSongs(playlistId) {
  const recEndpoint = playlistSongs(playlistId);
  return await axiosInstance.get(recEndpoint).then( (resp) => {
    return Promise.resolve(resp.data);
  }, (error) =>{
    return Promise.reject(error)
  })
}

export async function addSongToPlaylist(playlistId, songId) {
  const recEndpoint = playlistSongs(playlistId);
  return await axiosInstance.post(recEndpoint, {}, {
    params: {
      id: songId,
    },
  }).then( (resp) => {
    return Promise.resolve(resp.data);
  }, (error) =>{
    return Promise.reject(error)
  })
}

export async function deleteSongFromPlaylist(playlistId, songId) {
  const recEndpoint = playlistDeleteSong(playlistId, songId)
  return await axiosInstance.delete(recEndpoint, {
    params: {
      id: songId,
    }
  }).then( (resp) => {
    return Promise.resolve(resp.data);
  }, (error) =>{
    return Promise.reject(error)
  })
}
  
export async function updatePlaylistSettings(playlistId, newTitle, newDescription, newPublic) {
  const recEndpoint = playlistPutSettings(playlistId);
  return await axiosInstance.put(recEndpoint, {
    title: newTitle,
    description: newDescription,
    public: newPublic,
  }).then( (resp) => {
    return Promise.resolve(resp.data);
  }, (error) =>{
    return Promise.reject(error)
  })
}

export async function deletePlaylist(playlistId) {
  const recEndpoint = playlistDeletePlaylist(playlistId);
  return await axiosInstance.delete(recEndpoint).then( (resp) => {
    return Promise.resolve(resp.data);
  }, (error) => {
    return Promise.reject(error)
  });
}

export async function followPlaylist(playlistId, userId) {
  const recEndpoint = playlistFollowPlaylist(playlistId, userId);
  return await axiosInstance.post(recEndpoint).then( (resp) => {
    return Promise.resolve(resp.data);
  }, (error) =>{
    return Promise.reject(error)
  });
}

export async function unfollowPlaylist(playlistId, userId) {
  const recEndpoint = playlistUnfollowPlaylist(playlistId, userId);
  return await axiosInstance.delete(recEndpoint).then( (resp) => {
    return Promise.resolve(resp.data);
  }, (error) => {
    return Promise.reject(error)
  });
}

export async function copyPlaylist(targetPlaylistId, title, description, isPublic) {
  const recEndpoint = playlistCopyEndpoint(targetPlaylistId);
  return await axiosInstance.post(recEndpoint, {}, {
    params: {
      title: title,
      is_public: isPublic,
      desc: description,
    }
  }).then((resp) => {
    return Promise.resolve(resp.data);
  }, (error) => {
    return Promise.reject(error);
  });
}

export async function setPlaylistImage(playlistId, image) {
  const recEndpoint = playlistImageEndpoint(playlistId);
  let formData = new FormData();
  if(image == null){
    return Promise.reject();
  }
  formData.append('image', image)
  return await axiosInstance.post(recEndpoint, formData, 
  ).then((resp) => {
    return Promise.resolve(resp.data);
  }, (error) => {
    console.log(error);
    return Promise.reject(error);
  });
}

export async function getPlaylistImage(playlistId) {
  const recEndpoint = playlistImageEndpoint(playlistId);
  return await axiosInstance.get(recEndpoint).then((resp) => {
    return Promise.resolve(resp.data);
  }, (error) => {
    return Promise.reject(error);
  });
}



import axiosInstance from './axiosApi';

const baseUri = '/history';

const songListened = baseUri + "/";
const songLiked = (userId, songId) => baseUri + "/" + userId + '/likes/' + songId + '/';
const songDisliked = (userId, songId) => baseUri + "/" + userId + '/dislikes/' + songId + '/';

export async function listenToSong(songId) {
  const recEndpoint = songListened;
  return await axiosInstance.post(recEndpoint + '?song_id=' + songId).then(response => {
    return Promise.resolve(response.data);
  }, error => {
    return Promise.reject(error);
  });
}

export async function likeSong(userId, songId) {
  const recEndpoint = songLiked(userId, songId)
  const response = await axiosInstance.post(recEndpoint);
  return response.data;
}

export async function unlikeSong(userId, songId) {
  const recEndpoint = songLiked(userId, songId)
  const response = await axiosInstance.delete(recEndpoint);
  return response.data;
}

export async function dislikeSong(userId, songId) {
  const recEndpoint = songDisliked(userId, songId)
  const response = await axiosInstance.post(recEndpoint);
  return response.data;
}

export async function undislikeSong(userId, songId) {
  const recEndpoint = songDisliked(userId, songId)
  const response = await axiosInstance.delete(recEndpoint);
  return response.data;
}
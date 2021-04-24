import axiosInstance from './axiosApi';

const baseUri = '/user/';
const baseUri2 = '/users/';
const currentUserEndpointUri = baseUri + 'current/';
const userEndpointUri = (userId) => baseUri + userId + '/';
const playlistEndpointUri = (userId) => baseUri + userId + '/playlists/';
const registerEndpointUri = baseUri + 'create/';
const profileEndpointUri = (userId) => baseUri2 + userId + '/profile/';
const followingEndpointUri = (targetUid) => baseUri2 + 'profile/following/' + targetUid + '/';
const getSeedEndpointUri = baseUri + 'profile/get-seeds/';
const profileImageUri = baseUri + 'image/';
const deactiveAccountUri = baseUri + 'deactivate/';

export async function getCurrentUser() {
  const currentUserEndpoint = currentUserEndpointUri;
  return await axiosInstance.get(currentUserEndpoint).then(value => {
     return Promise.resolve(value.data);
  }, reason => {
    return Promise.reject(reason);
  });
}

export async function getUser(userId) {
  const userEndpoint = userEndpointUri(userId);
  return await axiosInstance.get(userEndpoint).then((resp) => {
    return Promise.resolve(resp.data);
  }, (error) =>{
    return Promise.reject(error)
  });
}

export async function getPlaylists(userId) {
  const playlistEndpoint = playlistEndpointUri(userId);
  return await axiosInstance.get(playlistEndpoint).then(resp => {
    return Promise.resolve(resp.data);
  }, error =>{
    return Promise.reject(error)
  })
}

export async function createPlaylist(userId, title, description, isPublic) {
  const playlistEndpoint = playlistEndpointUri(userId);
  // config is THIRD argument in post, so pass in empty object for data
  return await axiosInstance.post(playlistEndpoint, {}, {
    params: {
      title: title,
      is_public: isPublic,
      desc: description,
    }
  }).then(resp => {
    return Promise.resolve(resp.data);
  }, error =>{
    return Promise.reject(error);
  })
}

export async function createUser(email, username, password) {
  return await axiosInstance.post(registerEndpointUri, {
    email: email,
    username: username,
    password: password,
  }).then(resp => {
    return Promise.resolve(resp.data);
  }, error =>{
    return Promise.reject(error)
  })
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
  return await axiosInstance.post(profileEndpoint).then(resp => {
    return Promise.resolve(resp.data);
  }, (error) =>{
    return Promise.reject(error)
  })
}

export async function unfollowUser(targetUserId) {
  const profileEndpoint = followingEndpointUri(targetUserId);
  return await axiosInstance.delete(profileEndpoint).then(resp => {
    return Promise.resolve(resp.data);
  }, (error) =>{
    return Promise.reject(error)
  })
}

export async function getUserSeeds() {
  return await axiosInstance.get(getSeedEndpointUri).then(resp => {
    return Promise.resolve(resp.data);
  }, (error) =>{
    return Promise.reject(error)
  })
}

export async function setProfileImage(userId, image) {
  const imageEndpoint = profileImageUri;
  let formData = new FormData();
  if(image == null){
    return Promise.reject();
  }
  formData.append('image', image)
  return await axiosInstance.post(imageEndpoint, formData,
    ).then((resp) => {
    return Promise.resolve(resp.data);
  }, (error) => {
    return Promise.reject(error);
  });
};

export async function deactivateAccount() {
  return await axiosInstance.post(deactiveAccountUri).then(resp => {
    return Promise.resolve(resp.data);
  }, (error) =>{
    return Promise.reject(error)
  })
};

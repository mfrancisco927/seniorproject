import axiosInstance from './axiosApi';

const getSdkHeader = (accessToken) => {
  return {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${accessToken}`
  };
};

export async function playTrack(trackId, deviceId, accessToken) {
  const spotifyUri = trackId ? 'spotify:track:' + trackId : null;

  axiosInstance.put(
    `https://api.spotify.com/v1/me/player/play?device_id=${deviceId}`, 
    JSON.stringify((spotifyUri && { uris: [spotifyUri] }) || {}),
    { headers: getSdkHeader(accessToken) }
  );
}

export async function pauseCurrentTrack(deviceId, accessToken) {
  axiosInstance.put(
    `https://api.spotify.com/v1/me/player/pause?device_id=${deviceId}`,
    {},
    { headers: getSdkHeader(accessToken) },
  );
};
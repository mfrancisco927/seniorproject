/*
// copied code from Brian's individual project
<script src="https://sdk.scdn.co/spotify-player.js"></script>
<script>
  // just for testing! this token expires hourly, so a new one must be generated manually.
  // in our application, it will have to be retrieved at the start of the session after user
  // authentication and updated periodically
  const token = ;
  let spotifyPlayer = null;

  window.onSpotifyWebPlaybackSDKReady = () => {
    const player = new Spotify.Player({
      name: 'BeachWorm Web Player',
      getOAuthToken: cb => { cb(token); }
    });

    // Error handling
    player.addListener('initialization_error', ({ message }) => { console.error(message); });
    player.addListener('authentication_error', ({ message }) => { console.error(message); });
    player.addListener('account_error', ({ message }) => { console.error(message); });
    player.addListener('playback_error', ({ message }) => { console.error(message); });

    // Playback status updates
    player.addListener('player_state_changed', state => {
      console.log("New player state", state);
      const stateElement = document.getElementById('player-state-p');
      let newText = '';
      const track = state.track_window.current_track;

      if (track) {
        if (state.paused) {
          newText = '<em>' + track.name + '</em> by ' + track.artists[0].name + ' [PAUSED]';
        } else {
          newText = '<em>' + track.name + '</em> by ' + track.artists[0].name + ' [PLAYING]';
        }
      } else {
        newText = 'No current song playing';
      }

      stateElement.innerHTML = newText;
    });

    // Ready
    player.addListener('ready', ({ device_id }) => {
      console.log('Ready with Device ID', device_id);
    });

    // Not Ready
    player.addListener('not_ready', ({ device_id }) => {
      console.log('Device ID has gone offline', device_id);
    });

    // Connect to the player!
    player.connect().then(success => {
      if (success) {
        console.log('Web playback SDK successfully connected.');
        spotifyPlayer = player;
      }
    })

  };

  const play = ({
    spotify_uri,
    playerInstance: {
      _options: {
        getOAuthToken,
        id
      }
    }
  }) => {
    getOAuthToken(access_token => {
      fetch(`https://api.spotify.com/v1/me/player/play?device_id=${id}`, {
        method: 'PUT',
        body: JSON.stringify({ uris: [spotify_uri] }),
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${access_token}`
        },
      });
    });
  };

  const playTrack = (trackId) => {
    console.log("Playing track with ID " + trackId);
    play({
      playerInstance: spotifyPlayer,
      spotify_uri: 'spotify:track:' + trackId,
    });
  }

  const resumeSong = (trackId) => {
    console.log("Resuming song" + (trackId ? " with id " + trackId : ""));

    const {
      _options: {
        getOAuthToken,
        id
      }
    } = spotifyPlayer;

    const spotifyUri = trackId ? 'spotify:track:' + trackId : null;

    spotifyPlayer._options.getOAuthToken(access_token => {
      fetch(`https://api.spotify.com/v1/me/player/play?device_id=${id}`, {
        method: 'PUT',
        body: JSON.stringify(spotifyUri && { uris: [spotifyUri] } || {}),
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${access_token}`
        },
      });
    });
  }

  const pauseSong = () => {
    console.log("Pausing song");

    const {
      _options: {
        getOAuthToken,
        id
      }
    } = spotifyPlayer;

    spotifyPlayer._options.getOAuthToken(access_token => {
      fetch(`https://api.spotify.com/v1/me/player/pause?device_id=${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${access_token}`
        },
      });
    });
  }
</script>
*/
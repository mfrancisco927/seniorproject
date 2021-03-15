import { useSpotifySdk } from './../../hooks/spotifyHooks';
import SeekBar from './SeekBar';
import VolumeSlider from './VolumeSlider';

import PlayArrowIcon from '@material-ui/icons/PlayArrow';
import PauseIcon from '@material-ui/icons/Pause';
import PlaylistAddIcon from '@material-ui/icons/PlaylistAdd';
// import FavoriteIcon from '@material-ui/icons/Favorite'; // removing favorite feature for now
import { IconButton } from '@material-ui/core';

import './FloatingToolbar.css';

// should have: seek, volume, add to playlist, volume, pause/play
function FloatingToolbar(props) {
  const { duration, position } = props;
  const spotify = useSpotifySdk();
  const playerState = spotify.getPlayerState();

  const trackWindow = playerState && playerState.track_window;
  const currentTrack = trackWindow && trackWindow.current_track;

  const handlePlay = () => {
    spotify.togglePlay();
  }

  const handlePlaylistAdd = () => {
    console.log('Add to playlist called for song id ' + currentTrack.id);
  }

  return (
    <div className="floating-toolbar">
      <SeekBar duration={duration} position={position} disabled={!playerState} />
      <div className="controls-wrapper">
        <span className="">
          <VolumeSlider showIcon disabled={!playerState} />
          <div className="controls_small-buttons-wrapper">
            <IconButton onClick={handlePlay}>
              { spotify.isPlaying() ? (
                <PauseIcon className="controls_small-button"/>
              ) : (
                <PlayArrowIcon className="controls_small-button" />
              )}
            </IconButton>
            <IconButton onClick={handlePlaylistAdd}>
              <PlaylistAddIcon className="controls_small-button" />
            </IconButton>
          </div>
        </span>
      </div>
    </div>
  );
}

export default FloatingToolbar;
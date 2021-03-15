import { useSpotifySdk } from './../../hooks/spotifyHooks';
import SeekBar from './SeekBar';
import VolumeSlider from './VolumeSlider';

import PlayArrowIcon from '@material-ui/icons/PlayArrow';
import PauseIcon from '@material-ui/icons/Pause';
import PlaylistAddIcon from '@material-ui/icons/PlaylistAdd';
import FavoriteIcon from '@material-ui/icons/Favorite';
import { IconButton } from '@material-ui/core';

import './FloatingToolbar.css';

// should have: seek, volume, like (add to liked playlist), add to playlist, volume, pause/play
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

  const handleFavorite = () => {
    console.log("'Like' called for song id " + currentTrack.id);
  }

  return (
    <div className="explore-toolbar">
      <SeekBar duration={duration} position={position} />
      <div className="controls-wrapper">
        <span>
          <VolumeSlider showIcon />
          <IconButton onClick={handleFavorite}>
            <FavoriteIcon />
          </IconButton>
          <IconButton onClick={handlePlay}>
            { spotify.isPlaying() ? <PauseIcon /> : <PlayArrowIcon /> }
          </IconButton>
          <IconButton onClick={handlePlaylistAdd}>
            <PlaylistAddIcon />
          </IconButton>
        </span>
      </div>
    </div>
  );
}

export default FloatingToolbar;
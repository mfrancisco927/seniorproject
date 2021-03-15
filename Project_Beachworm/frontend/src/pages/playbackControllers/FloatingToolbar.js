import SeekBar from './SeekBar';

import PlayArrowIcon from '@material-ui/icons/PlayArrow';
import { VolumeUp, VolumeDown, VolumeMute, VolumeOff } from '@material-ui/icons';
import PauseIcon from '@material-ui/icons/Pause';
import PlaylistAddIcon from '@material-ui/icons/PlaylistAdd';

import './FloatingToolbar.css';

// should have: seek, volume, like (add to liked playlist), add to playlist, volume, pause/play
function FloatingToolbar(props) {
  const { duration, position } = props;
  return (
    <div className="explore-toolbar">
      <SeekBar duration={duration} position={position} />
      <div className="controls-wrapper">
        
      </div>
    </div>
  );
}

export default FloatingToolbar;
import Slider from '@material-ui/core/Slider';
import { useSpotifySdk } from './../../hooks/spotifyHooks';
import './SeekBar.css';

function SeekBar(props) {
  const { position, duration } = props;
  const spotify = useSpotifySdk();

  const positionSec = Math.floor(position / 1000) % 60;
  const positionMin = Math.floor(position / 1000 / 60);
  const durationSec = Math.floor(duration / 1000) % 60;
  const durationMin = Math.floor(duration / 1000 / 60);

  const formatTime = (minutes, seconds) => {
    return `${minutes}`.padStart(1, '0') + ':' + `${seconds}`.padStart(2, '0');
  }

  const handleSeekSlide = (_event, newValue) => {
    spotify.seek(newValue / 100 * duration);
  }

  return (
    <div className="scan-wrapper">
      <p className="scan_elapsed">{(position || position === 0) && formatTime(positionMin, positionSec)}</p>
      <span className="scan_slider">
      <Slider value={position / duration * 100} onChange={handleSeekSlide} aria-labelledby="continuous-slider" />
      </span>
      <p className="scan_song-length">{(duration || duration === 0) && formatTime(durationMin, durationSec)}</p>
    </div>
  );
}

export default SeekBar;
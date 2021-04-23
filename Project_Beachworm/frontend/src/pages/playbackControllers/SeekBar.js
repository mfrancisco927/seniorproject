import Slider from '@material-ui/core/Slider';
import { useSpotifySdk } from './../../hooks/spotifyHooks';
import { createBlockWrapper } from './../../util/bem-helpers';
import './SeekBar.scss';

function SeekBar(props) {
  const { position, duration, disabled } = props;
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

  const block = createBlockWrapper('scan');

  return (
    <div className={block('wrapper')}>
      <p className={block('elapsed')}>{(position || position === 0) && formatTime(positionMin, positionSec)}</p>
      <span className={block('slider')}>
      <Slider
        value={position / duration * 100}
        onChange={handleSeekSlide}
        disabled={disabled}
        aria-labelledby="continuous-slider" />
      </span>
      <p className={block('song-length')}>{(duration || duration === 0) && formatTime(durationMin, durationSec)}</p>
    </div>
  );
}

export default SeekBar;
import { useCallback } from 'react';
import Slider from '@material-ui/core/Slider';
import { VolumeUp, VolumeDown, VolumeMute, VolumeOff } from '@material-ui/icons';
import { useSpotifySdk } from './../../hooks/spotifyHooks';
import './VolumeSlider.css';

function VolumeSlider(props) {
  const { showIcon, disabled } = props;
  const spotify = useSpotifySdk();
  const volume = spotify.getVolume() * 100;
  const muted = spotify.isMuted();

  const handleVolumeSlide = (_event, newValue) => {
    spotify.setMuted(false);
    scaleAndSetVolume(newValue);
  }
  
  const VolumeIcon = () => {
    const handleMuteClick = useCallback(() => {
      if (muted) {
        spotify.setMuted(false);
        scaleAndSetVolume(volume);
      } else {
        spotify.setMuted(true);
        scaleAndSetVolume(0);
      }
    }, []);

    if (volume === 0 || muted) {
      return <VolumeOff className="volume-slider_icon" onClick={handleMuteClick} />;
    } else if (volume < 10) {
      return <VolumeMute className="volume-slider_icon" onClick={handleMuteClick} />;
    } else if (volume < 50) {
      return <VolumeDown className="volume-slider_icon" onClick={handleMuteClick} />
    } else {
      return <VolumeUp className="volume-slider_icon" onClick={handleMuteClick} />
    }
  }

  const scaleAndSetVolume = (vol) => {
    let volFloat = vol / 100;
    // minimum of 0, maximum of 1.0 enforced. the spotify player has a bug where
    // a volume of exactly 0 throws an error so 10^-6 is close enough
    volFloat = Math.max(1e-6, Math.min(volFloat, 1.0));
    spotify.setVolume(volFloat);
  }

  return (
    <div className="volume-slider_wrapper">
      {showIcon && <VolumeIcon />}
      <Slider
        className={"volume-slider_slider" + (showIcon ? "" : "volume-slider_slider__no-icon")}
        value={muted ? 0 : volume}
        onChange={handleVolumeSlide}
        aria-labelledby="continuous-slider" 
        disabled={disabled || !spotify.isPlayerReady()}/>
    </div>
  );
}

export default VolumeSlider;
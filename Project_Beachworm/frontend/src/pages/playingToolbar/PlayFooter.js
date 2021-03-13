import { useState, useEffect, Fragment } from 'react';
import { useSpotifySdk } from './../../hooks/spotifyHooks';
import ScrollText from './ScrollText';
import Slider from '@material-ui/core/Slider';
import PlayArrowIcon from '@material-ui/icons/PlayArrow';
import PauseIcon from '@material-ui/icons/Pause';
import SkipNext from '@material-ui/icons/SkipNext';
import SkipPrevious from '@material-ui/icons/SkipPrevious';
import PlaylistAddIcon from '@material-ui/icons/PlaylistAdd';
import ShuffleIcon from '@material-ui/icons/Shuffle';
// import PlaylistAddCheckIcon from '@material-ui/icons/PlaylistAddCheck';

import './PlayFooter.css';

function PlayFooter() {
  const spotify = useSpotifySdk();
  const [isPlaying, setPlaying] = useState(false);
  const [currState, setCurrState] = useState({});
  const [prevAlbumUri, setPrevAlbumUri] = useState(null);
  const [albumImg, setAlbumImg] = useState(null);

  const position = currState.position;

  const {
    name,
    artists,
    album: {
      images: albumImages,
      name: albumName,
      uri: albumUri
    },
    duration_ms,
  } = currState.track_window ? 
    currState.track_window.current_track :
    { name: undefined, artists: undefined, album: { images: undefined, name: undefined, uri: undefined}, duration_ms: undefined};

  const positionSec = Math.floor(position / 1000) % 60;
  const positionMin = Math.floor(position / 1000 / 60);
  const durationSec = Math.floor(duration_ms / 1000) % 60;
  const durationMin = Math.floor(duration_ms / 1000 / 60);
  // console.log(currState);

  if (albumUri && prevAlbumUri !== albumUri) {
    console.log(albumImages);
    console.log(albumUri);
    setPrevAlbumUri(albumUri);
    setAlbumImg(<img className="play-footer_album-art" src={albumImages[1].url} alt={albumName +' album art'} />);
  }

  const handleSlide = (_event, newValue) => {
    spotify.seek(newValue / 100 * duration_ms);
  }

  useEffect(() => {
    spotify.addStateListener({'PlayFooter': (nextState) => {
      setCurrState(nextState);
      if (nextState && nextState.paused) {
        setPlaying(false);
      }
      // if (nextState && nextState.track_window && nextState.track_window.current_track) {
      //   setSliderValue(nextState.position / nextState.track_window.current_track.duration_ms * 100);
      // }
    }});
  }, []);

  const scrollProps = {
    rampMillis: 500,
    decayMillis: 500,
    speed: 45,
  }

  const formatTime = (minutes, seconds) => {
    return `${minutes}`.padStart(1, '0') + ':' + `${seconds}`.padStart(2, '0');
  }

  return (
    <span className='play-footer'>
      <div className="play-footer_album-art-wrapper">
        {albumImg}
      </div>
      <div className="play-footer_song-info">
        {name && <Fragment>
          <p className="nowPlayingText">Now Playing</p>
          <ScrollText {...scrollProps}>{name}</ScrollText>
          <ScrollText {...scrollProps}>{artists.map(artist => artist.name).join(', ')}</ScrollText>
        </Fragment>}
      </div>
      <div className="play-footer_playback-controls">
          <span className="grid-row scan-wrapper">
            <p className="scan_elapsed">{(position || position === 0) && formatTime(positionMin, positionSec)}</p>
            <span className="scan_slider">
              <Slider value={position / duration_ms * 100} onChange={handleSlide} aria-labelledby="continuous-slider" />
            </span>
            <p className="scan_song-length">{(duration_ms || duration_ms === 0) && formatTime(durationMin, durationSec)}</p>
          </span>
          <div className="player-footer_playback-controls_buttons grid-row">
            <button className='control-button'><SkipPrevious /></button>
            <button className='control-button' onClick={() => {
              spotify.togglePlay();
              setPlaying(!isPlaying);
            }}>
              {isPlaying ? <PauseIcon /> : <PlayArrowIcon />}
            </button>
            <button className='control-button'><SkipNext /></button>
          </div>
      </div>
      <div className="profile-controls-wrapper">
        <PlaylistAddIcon className="profile-controls_item"/>
        <ShuffleIcon className="profile-controls_item" />
        <button className="profile-controls_item" onClick={() => {
              spotify.play('4OdGWYrATA6GKBCBjXkb2E');
              setPlaying(true);
            }}>
              S
            </button>
      </div>
    </span>
  );
}

export default PlayFooter;
import { useState, useEffect, Fragment } from 'react';
import { useSpotifySdk } from './../../hooks/spotifyHooks';
import ScrollText from './ScrollText';
import Slider from '@material-ui/core/Slider';
import PlayArrowIcon from '@material-ui/icons/PlayArrow';
import { VolumeUp, VolumeDown, VolumeMute, VolumeOff } from '@material-ui/icons';
import PauseIcon from '@material-ui/icons/Pause';
import SkipNext from '@material-ui/icons/SkipNext';
import SkipPrevious from '@material-ui/icons/SkipPrevious';
import PlaylistAddIcon from '@material-ui/icons/PlaylistAdd';
import ShuffleIcon from '@material-ui/icons/Shuffle';
import QueueMusicIcon from '@material-ui/icons/QueueMusic';
import QueuePopover from './QueuePopover';

import './PlayFooter.css';

function PlayFooter() {
  const spotify = useSpotifySdk();
  const [isPlaying, setPlaying] = useState(false);
  const [currState, setCurrState] = useState({});
  const [prevAlbumUri, setPrevAlbumUri] = useState(null);
  const [albumImg, setAlbumImg] = useState(null);
  const [trackEnded, setTrackEnded] = useState(false);
  const [popoverAnchorEl, setPopoverAnchorEl] = useState(null);
  const [currentTrack, setCurrentTrack] = useState(null);
  const [shouldShuffle, setShuffle] = useState(false);
  const [volume, setVolume] = useState(100);
  const [muted, setMuted] = useState(false);

  const testQueueables = [
    {
      name: 'Lions!',
      id: '4OdGWYrATA6GKBCBjXkb2E',
    },
    {
      name: 'Onwards',
      id: '1K4WIx8NrOCdedkJwSCaAQ',
    },
    {
      name: 'New Chapter',
      id: '5Yn7hFF4Ap9tYZJOyyd7Ui',
    },
    {
      name: 'Everything Matters',
      id: '68ihyK7c8TRIkN5dFVnSYY',
    },
    {
      name: 'Ego',
      id: '5NoZA0PvEGP1kFkQv2vJTQ',
    },
    {
      name: 'Enter',
      id: '3VXtkBYkeDqVTECO1OOdXd',
    },
  ]
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

  if (albumUri && prevAlbumUri !== albumUri) {
    console.log(albumImages);
    console.log(albumUri);
    setPrevAlbumUri(albumUri);
    setAlbumImg(<img className="play-footer_album-art" src={albumImages[1].url} alt={albumName +' album art'} />);
  }

  const handleSeekSlide = (_event, newValue) => {
    spotify.seek(newValue / 100 * duration_ms);
  }
  
  const handleVolumeSlide = (_event, newValue) => {
    setMuted(false);
    setVolume(newValue);
    scaleAndSetVolume(newValue);
  }

  const scaleAndSetVolume = (vol) => {
    let volFloat = Math.floor(vol + 0.5) / 100;
    // minimum of 0, maximum of 1.0 enforced. the spotify player has a bug where
    // a volume of exactly 0 throws an error so 10^-6 is close enough
    volFloat = Math.max(1e-6, Math.min(volFloat, 1.0));
    spotify.setVolume(volFloat);
  }

  useEffect(() => {
    if (trackEnded) {
      // TODO: fire 'listened to' endpoint to add to user history
      console.log('Track ending detected');
      const nextSong = spotify.dequeueNextSong(shouldShuffle);
      if (nextSong) {
        spotify.play(nextSong.id);
      }
    }
  }, [trackEnded]);

  const handleQueueClicked = (event) => {
    setPopoverAnchorEl(event.currentTarget);
  }

  const handleNewState = (nextState) => {
    setCurrState(nextState);
    // update our pause button
    if (nextState) {
      setPlaying(!nextState.paused);
      
      if (!nextState.paused) {
        setTrackEnded(false);
      }
    }

    // check for the end of the track
    // spotify doesn't have any sort of "song ended" callback sadly,
    // so this borrows from this answer: https://github.com/spotify/web-playback-sdk/issues/35#issuecomment-509159445
    if (!trackEnded && currState
      && nextState.track_window.previous_tracks.find(x => x.id === nextState.track_window.current_track.id)
      && !currState.paused
      && nextState.paused) {
        // console.log('Track ended');
        setTrackEnded(true);
        setCurrentTrack(null);
    } else {
      setCurrentTrack(nextState.track_window && nextState.track_window.current_track);
    }
  };

  useEffect(() => {
    spotify.addStateListener({'PlayFooter': (nextState) => handleNewState(nextState)});
  }, []);

  const scrollProps = {
    rampMillis: 500,
    decayMillis: 500,
    speed: 45,
  }

  const formatTime = (minutes, seconds) => {
    return `${minutes}`.padStart(1, '0') + ':' + `${seconds}`.padStart(2, '0');
  }

  const handleSkip = () => {
    const nextSong = spotify.dequeueNextSong(shouldShuffle);
    if (nextSong) {
      spotify.play(nextSong.id);
    }
  }
  
  const handleToggle = () => {
    if (currState && currState.track_window) {
      if (currState.track_window.current_track) {
        spotify.togglePlay();
        setPlaying(!isPlaying);
        return;
      }
    }

    const nextSong = spotify.dequeueNextSong(shouldShuffle);

    if (nextSong) {
      spotify.play(nextSong.id);
    }
  }

  const getVolumeIcon = () => {
    const handleMuteClick = () => {
      if (muted) {
        setMuted(false);
        scaleAndSetVolume(volume);
      } else {
        setMuted(true);
        scaleAndSetVolume(0);
      }
    }

    if (volume === 0 || muted) {
      return <VolumeOff onClick={handleMuteClick} />;
    } else if (volume < 10) {
      return <VolumeMute onClick={handleMuteClick} />;
    } else if (volume < 50) {
      return <VolumeDown onClick={handleMuteClick} />
    } else {
      return <VolumeUp onClick={handleMuteClick} />
    }
  }

  return (
    <span className='play-footer'>
      <div className="play-footer_album-art-wrapper">
        {albumImg}
      </div>
      <div className="play-footer_song-info">
        {name && <Fragment>
          <ScrollText {...scrollProps}>Now Playing</ScrollText>
          <ScrollText {...scrollProps}>{name}</ScrollText>
          <ScrollText {...scrollProps}>{artists.map(artist => artist.name).join(', ')}</ScrollText>
        </Fragment>}
      </div>
      <div className="play-footer_playback-controls">
          <span className="grid-row scan-wrapper">
            <p className="scan_elapsed">{(position || position === 0) && formatTime(positionMin, positionSec)}</p>
            <span className="scan_slider">
              <Slider value={position / duration_ms * 100} onChange={handleSeekSlide} aria-labelledby="continuous-slider" />
            </span>
            <p className="scan_song-length">{(duration_ms || duration_ms === 0) && formatTime(durationMin, durationSec)}</p>
          </span>
          <div className="player-footer_playback-controls_buttons grid-row">
            <button className='control-button'><SkipPrevious /></button>
            <button className='control-button' onClick={handleToggle}>
              {isPlaying ? <PauseIcon /> : <PlayArrowIcon />}
            </button>
            <SkipNext className='control-button' onClick={handleSkip}/>
          </div>
      </div>
      <div className="profile-controls-wrapper">
        <QueuePopover
          currentTrack={currentTrack}
          userQueue={spotify.getUserPlayQueue()}
          contextQueue={spotify.getContextPlayQueue()}
          anchorEl={popoverAnchorEl}
          onCloseCallback={() => setPopoverAnchorEl(null)}
          deleteFromUserQueue={spotify.deleteUserQueueSong}
          deleteFromContextQueue={spotify.deleteContextQueueSong}
          clearUserQueue={spotify.clearUserPlayQueue}
          clearContextQueue={spotify.clearContextPlayQueue}
        />
        <span className="profile-controls_row">
          <PlaylistAddIcon className="profile-controls_item"/>
          <ShuffleIcon 
            onClick={() => setShuffle(!shouldShuffle)}
            className={"profile-controls_item" + (shouldShuffle ? " profile-controls_item__active" : "")} />
          <QueueMusicIcon className="profile-controls_item" 
            aria-owns={popoverAnchorEl ? 'queue-popover' : undefined}
            aria-haspopup="true"
            onClick={handleQueueClicked} />
          <button className="profile-controls_item"
              onClick={() => spotify.addToUserPlayQueue(testQueueables)}>
            Enq
          </button>
        </span>
        <span className="profile-controls_row volume-slider_wrapper">
            {getVolumeIcon()}
            <Slider
              className="volume-slider_slider"
              value={muted ? 0 : volume}
              onChange={handleVolumeSlide}
              aria-labelledby="continuous-slider" />
        </span>
      </div>
    </span>
  );
}

export default PlayFooter;
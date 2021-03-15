import { useState, Fragment } from 'react';
import { useSpotifySdk } from './../../hooks/spotifyHooks';
import SeekBar from './SeekBar';
import ScrollText from './ScrollText';
import PlayArrowIcon from '@material-ui/icons/PlayArrow';
import PauseIcon from '@material-ui/icons/Pause';
import SkipNext from '@material-ui/icons/SkipNext';
import SkipPrevious from '@material-ui/icons/SkipPrevious';
import PlaylistAddIcon from '@material-ui/icons/PlaylistAdd';
import ShuffleIcon from '@material-ui/icons/Shuffle';
import QueueMusicIcon from '@material-ui/icons/QueueMusic';
import QueuePopover from './QueuePopover';
import VolumeSlider from './VolumeSlider';

import './PlayFooter.css';

function PlayFooter() {
  const spotify = useSpotifySdk();
  const [popoverAnchorEl, setPopoverAnchorEl] = useState(null);

  const shuffling = spotify.isShuffling();

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
  ];

  const currState = spotify.getPlayerState();
  const position = currState.position;
  const trackWindow = currState && currState.track_window;
  const currentTrack = trackWindow && trackWindow.current_track;

  const {
    name,
    artists,
    album: {
      images: albumImages,
      name: albumName,
    },
    duration_ms,
  } = currentTrack ||
    { name: undefined, artists: undefined, album: { images: undefined, name: undefined, uri: undefined}, duration_ms: undefined};

  const handleQueueClicked = (event) => {
    setPopoverAnchorEl(event.currentTarget);
  }

  const scrollProps = {
    rampMillis: 500,
    decayMillis: 500,
    speed: 45,
  }
  
  const handleToggle = () => {
    if (currentTrack) {
      // toggle and return if there's a currently playing song
      spotify.togglePlay();
      return;
    } else {
      // if there's no currently playing song, play the next one
      const nextSong = spotify.dequeueNextSong();
      if (nextSong) {
        spotify.play(nextSong.id);
      }
    }
  }

  const albumImg = (
    albumImages ? (
      <img className="play-footer_album-art" src={albumImages[1].url} alt={albumName +' album art'} />
    ) : (
      <img className="play-footer_album-art" alt="" />
    )
  )

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
          <div className="grid-row seek-wrapper">
            <SeekBar duration={duration_ms} position={position} />
          </div>
          <div className="player-footer_playback-controls_buttons grid-row">
            <button className='control-button'><SkipPrevious /></button>
            <button className='control-button' onClick={handleToggle}>
              {spotify.isPlaying() ? <PauseIcon /> : <PlayArrowIcon />}
            </button>
            <button className='control-button' onClick={spotify.skip}>
              <SkipNext />
            </button>
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
            onClick={() => spotify.setShuffle(!shuffling)}
            className={"profile-controls_item" + (shuffling ? " profile-controls_item__active" : "")} />
          <QueueMusicIcon className="profile-controls_item" 
            aria-owns={popoverAnchorEl ? 'queue-popover' : undefined}
            aria-haspopup="true"
            onClick={handleQueueClicked} />
          <button className="profile-controls_item"
              onClick={() => spotify.addToUserPlayQueue(testQueueables)}>
            Enq
          </button>
        </span>
        <span className="profile-controls_row">
          <VolumeSlider showIcon />
        </span>
      </div>
    </span>
  );
}

export default PlayFooter;
import { useState, Fragment } from 'react';
import { useSpotifySdk } from './../../hooks/spotifyHooks';
import { useWindowDimensions, SCREEN_SIZE } from './../../hooks/responsiveHooks';
import AddToPlaylistPopover from './../playlist/AddToPlaylistPopover';
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

import './PlayFooter.scss';

function PlayFooter() {
  const spotify = useSpotifySdk();
  const [popoverAnchorEl, setPopoverAnchorEl] = useState(null);

  const shuffling = spotify.isShuffling();

  const currState = spotify.getPlayerState();
  const position = currState.position;
  const trackWindow = currState && currState.track_window;
  const currentTrack = trackWindow && trackWindow.current_track;
  const { width } = useWindowDimensions();
  const isMobile = width <= SCREEN_SIZE.SMALL;

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

  const [ addToPlaylistOpen, setAddToPlaylistOpen ] = useState(false);
  const [ anchorRef, setAnchorRef ] = useState(null);

  const handlePlaylistAdd = () => {
    setAddToPlaylistOpen(true);
  }

  const scrollProps = {
    rampMillis: 500,
    decayMillis: 1000,
    speed: 30,
  }

  const handlePrevious = () => {
    spotify.playPrevious();
  }
  
  const handleToggle = async () => {
    if (currentTrack) {
      // toggle and return if there's a currently playing song
      spotify.togglePlay();
      return;
    } else {
      // if there's no currently playing song, play the next one
      const nextSong = spotify.dequeueNextSong();
      if (nextSong) {
        await spotify.play(nextSong.id).catch(_e => console.log("Can't play yet!"));
      }
    }
  }

  const mobileClassName = (parent) => (isMobile ? parent + ' ' + parent + '__mobile' : parent);

  const albumImg = (
    albumImages ? (
      <img className="play-footer_album-art" src={albumImages[0].url} alt={albumName +' album art'} />
    ) : (
      <img className="play-footer_album-art" alt="" />
    )
  )

  const songDetails = (
    <div className={mobileClassName('play-footer_song-info')}>
      {name && <Fragment>
        {!isMobile && <ScrollText {...scrollProps}>Now Playing</ScrollText>}
        <ScrollText {...scrollProps}>{name}</ScrollText>
        <ScrollText {...scrollProps}>{artists.map(artist => artist.name).join(', ')}</ScrollText>
      </Fragment>}
    </div>
  );

  const albumArt = (
    <div className={mobileClassName('play-footer_album-art-wrapper')}>
      {albumImg}
    </div>
  );

  const queuePopover = (
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
  );

  const addToPlaylistPopover = (
    <AddToPlaylistPopover
        anchorEl={anchorRef}
        open={addToPlaylistOpen}
        onClose={() => setAddToPlaylistOpen(false)}
        song={currentTrack} />
  );

  const shuffleButton = (
    <button className='control-button' onClick={() => spotify.setShuffle(!shuffling)}>
      <ShuffleIcon
      className={mobileClassName("profile-controls_item") + (shuffling ? " profile-controls_item__active" : "")} />
    </button>
  );

  const showQueueButton = (
    <button className='control-button' onClick={handleQueueClicked}>
      <QueueMusicIcon className={mobileClassName("profile-controls_item")}
      aria-owns={popoverAnchorEl ? 'queue-popover' : undefined}
      aria-haspopup="true"/>
    </button>
  );

  const addToPlaylistButton = (
    <button
      className='control-button'
      onClick={handlePlaylistAdd}
      ref={el => setAnchorRef(el)}>
      <PlaylistAddIcon className="playlist-add"/>
    </button>
  );

  const songControlsRow = (
    <div className={mobileClassName('play-footer_playback-controls_buttons')}>
      {/* {isMobile && showQueueButton} */}
      <button className='control-button' onClick={handlePrevious}><SkipPrevious /></button>
      <button className='control-button' onClick={handleToggle}>
        {spotify.isPlaying() ? <PauseIcon /> : <PlayArrowIcon />}
      </button>
      <button className='control-button' onClick={spotify.skip}>
        <SkipNext />
      </button>
      {/* {isMobile && shuffleButton} */}
    </div>
  );

  const seekBar = (
    <div className={mobileClassName('seek-wrapper')}>
      <SeekBar duration={duration_ms} position={position} disabled={!currState} />
    </div>
  );

  const profileControls = (
    <div className="profile-controls-wrapper">
      {queuePopover}
      <span className="profile-controls_row">
        {addToPlaylistButton}
        {shuffleButton}
        {showQueueButton}
      </span>
      <span className="profile-controls_row">
        <VolumeSlider showIcon />
      </span>
    </div>
  );

  return !isMobile ? (
    <span className='play-footer'>
      {albumArt}
      {songDetails}
      <div className="play-footer_playback-controls">
          {seekBar}
          {songControlsRow}
      </div>
      {profileControls}
      {addToPlaylistPopover}
    </span>
  ) : (
    <span className={mobileClassName('play-footer')}>
      {albumArt}
      <div className="play-footer_mobile-main-content">
        <div className="play-footer_extended-song-details-row">
          {songDetails}
        </div>
        <div className={mobileClassName('play-footer_playback-controls')}>
            {seekBar}
            {songControlsRow}
            <div className={mobileClassName('play-footer_volume-row')}>
              {queuePopover}
              {addToPlaylistButton}
              {showQueueButton}
              {shuffleButton}
              {/* <VolumeSlider showIcon /> */}
            </div>
        </div>
      </div>
      {addToPlaylistPopover}
    </span>
  );
}

export default PlayFooter;
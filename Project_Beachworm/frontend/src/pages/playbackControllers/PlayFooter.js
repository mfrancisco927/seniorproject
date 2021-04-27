import React, { useRef, useState, useCallback, Fragment, useEffect, memo } from 'react';
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

const mobileClassName = (isMobile, parent) => (isMobile ? parent + ' ' + parent + '__mobile' : parent);

const AlbumImg = ({currentTrack}) => {
  const { album: {
    images: albumImages,
    name: albumName,
  }} = currentTrack || { album: { images: undefined, name: undefined, uri: undefined } };

  return albumImages ? (
    <img className="play-footer_album-art" src={albumImages[0].url} alt={albumName +' album art'} />
  ) : (
    <img className="play-footer_album-art" alt="" />
  )
};

const SongDetails = ({isMobile, currentTrack, scrollProps}) => {
  const { name, artists, } = currentTrack || {};

  return (
    <div className={mobileClassName(isMobile, 'play-footer_song-info')}>
      {name && <Fragment>
        {!isMobile && <ScrollText {...scrollProps}>Now Playing</ScrollText>}
        <ScrollText {...scrollProps}>{name}</ScrollText>
        <ScrollText {...scrollProps}>{artists.map(artist => artist.name).join(', ')}</ScrollText>
      </Fragment>}
    </div>
  );
}

const AlbumArtWrapper = ({isMobile, currentTrack}) => (
  <div className={mobileClassName(isMobile, 'play-footer_album-art-wrapper')}>
    <AlbumImg currentTrack={currentTrack}/>
  </div>
);

const FooterQueuePopover = ({currentTrack, showQueuePopover, queuePopoverRef, closeQueuePopover}) => (
  <QueuePopover
    currentTrack={currentTrack}
    open={showQueuePopover}
    anchorEl={queuePopoverRef.current}
    onCloseCallback={closeQueuePopover} />
);

const FooterAddToPlaylistPopover = ({currentTrack, addPlaylistAnchorRef, addToPlaylistOpen, closeAddToPlaylistPopover}) => (
  <AddToPlaylistPopover
    open={addToPlaylistOpen}
    anchorEl={addPlaylistAnchorRef.current}
    onClose={closeAddToPlaylistPopover}
    song={currentTrack} />
);

const ShuffleButton = ({isMobile, spotify, shuffling}) => (
  <button className='control-button' onClick={() => spotify.setShuffle(!shuffling)}>
    <ShuffleIcon
    className={mobileClassName(isMobile, "profile-controls_item") + (shuffling ? " profile-controls_item__active" : "")} />
  </button>
);

const ShowQueueButton = ({isMobile, queuePopoverRef, handleQueueClicked}) => (
  <button
  className='control-button'
  ref={queuePopoverRef}
  onClick={handleQueueClicked}>
    <QueueMusicIcon className={mobileClassName(isMobile, "profile-controls_item")}
    aria-owns={queuePopoverRef.current ? 'queue-popover' : undefined}
    aria-haspopup="true" />
  </button>
);

const AddToPlaylistButton = ({addPlaylistAnchorRef, handlePlaylistAdd}) => (
  <button
    className='control-button'
    ref={addPlaylistAnchorRef}
    onClick={handlePlaylistAdd}>
    <PlaylistAddIcon className="playlist-add"
    aria-owns={addPlaylistAnchorRef.current ? 'playlist-popover' : undefined}/>
  </button>
);

const SongControlsRow = ({isMobile, handlePrevious, handleToggle, handleSkip, isPlaying}) => (
  <div className={mobileClassName(isMobile, 'play-footer_playback-controls_buttons')}>
    <button className='control-button' onClick={handlePrevious}><SkipPrevious /></button>
    <button className='control-button' onClick={handleToggle}>
      {isPlaying ? <PauseIcon /> : <PlayArrowIcon />}
    </button>
    <button className='control-button' onClick={handleSkip}>
      <SkipNext />
    </button>
  </div>
);

const WrappedSeekBar = memo(({isMobile, duration, position, disabled}) => (
  <div className={mobileClassName(isMobile, 'seek-wrapper')}>
    <SeekBar duration={duration} position={position} disabled={disabled} />
  </div>
));

const ProfileControls = ({currentTrack, showQueuePopover, queuePopoverRef,
  closeQueuePopover, addPlaylistAnchorRef, handlePlaylistAdd, handleQueueClicked, spotify, shuffling}) => (
  <div className="profile-controls-wrapper">
    <span className="profile-controls_row">
      <AddToPlaylistButton
        addPlaylistAnchorRef={addPlaylistAnchorRef}
        handlePlaylistAdd={handlePlaylistAdd}/>
      <ShuffleButton
        spotify={spotify}
        shuffling={shuffling}/>
      <ShowQueueButton
        queuePopoverRef={queuePopoverRef}
        handleQueueClicked={handleQueueClicked} />
    </span>
    <span className="profile-controls_row">
      <VolumeSlider showIcon />
    </span>
  </div>
);

function PlayFooter() {
  const spotify = useSpotifySdk();
  const [spotifyDetails, setSpotifyDetails] = useState({});
  const { shuffling, currState, currentTrack, position, isPlaying } = spotifyDetails;
  const { width } = useWindowDimensions();
  const isMobile = width <= SCREEN_SIZE.SMALL;

  const UPDATE_DELTA_T = 250;
  const [lastUpdateTime, setLastUpdateTime] = useState(0);

  // popover state
  const [showQueuePopover, setShowQueuePopover] = useState(false);
  const [addToPlaylistOpen, setAddToPlaylistOpen] = useState(false);
  const queuePopoverRef = useRef(null);
  const addPlaylistAnchorRef = useRef(null);
  
  const closeAddToPlaylistPopover = useCallback(() => setAddToPlaylistOpen(false), []);
  const closeQueuePopover = useCallback(() => setShowQueuePopover(false), []);

  // only refreshes every UPDATE_DELTA_T ms
  useEffect(() => {
    const newTime = new Date().getTime();
    if (newTime - lastUpdateTime > UPDATE_DELTA_T) {
      const nextState = spotify.getPlayerState();
      setSpotifyDetails({
        shuffling: spotify.isShuffling(),
        currentTrack: spotify.getCurrentTrack(),
        currState: nextState,
        position: nextState.position,
        isPlaying: spotify.isPlaying(),
      });
      setLastUpdateTime(newTime);
    }
  }, [lastUpdateTime, spotify]);

  const handlePlaylistAdd = useCallback(() => {
    setAddToPlaylistOpen(true);
  }, []);
  
  const handleQueueClicked = useCallback(() => {
    setShowQueuePopover(true);
  }, []);

  const scrollProps = {
    rampMillis: 500,
    decayMillis: 1000,
    speed: 30,
  }

  const handleSkip = useCallback(() => {
    spotify.skip();
  }, [spotify])

  const handlePrevious = useCallback(() => {
    spotify.playPrevious();
  }, [spotify]);
  
  const handleToggle = useCallback(() => {
    const asyncToggle = async () => {
      if (currentTrack) {
        // toggle and return if there's a currently playing song
        await spotify.togglePlay();
        return;
      } else {
        // if there's no currently playing song, play the next one
        const nextSong = spotify.dequeueNextSong();
        if (nextSong) {
          await spotify.play(nextSong).catch(_e => console.log("Can't play yet!"));
        }
      }
    }

    asyncToggle();
  }, [currentTrack, spotify])

  const mobileProps = {isMobile: isMobile};

  return (
    <Fragment>
      <FooterAddToPlaylistPopover 
        {...mobileProps}
        currentTrack={currentTrack}
        addPlaylistAnchorRef={addPlaylistAnchorRef}
        addToPlaylistOpen={addToPlaylistOpen}
        closeAddToPlaylistPopover={closeAddToPlaylistPopover} />
      <FooterQueuePopover 
        currentTrack={currentTrack}
        showQueuePopover={showQueuePopover}
        queuePopoverRef={queuePopoverRef}
        closeQueuePopover={closeQueuePopover}/>
      {!isMobile ? (
        <span className='play-footer'>
          <AlbumArtWrapper
          {...mobileProps}
          currentTrack={currentTrack} />
          <SongDetails
            {...mobileProps}
            currentTrack={currentTrack}
            scrollProps={scrollProps} />
          <div className="play-footer_playback-controls">
            <WrappedSeekBar
              {...mobileProps}
              duration={currState && currState.duration}
              position={position}
              disabled={!currState} />
            <SongControlsRow
              {...mobileProps}
              handlePrevious={handlePrevious}
              handleToggle={handleToggle}
              handleSkip={handleSkip} 
              isPlaying={isPlaying} />
          </div>
          <ProfileControls
            {...mobileProps}
            currentTrack={currentTrack}
            showQueuePopover={showQueuePopover}
            queuePopoverRef={queuePopoverRef}
            closeQueuePopover={closeQueuePopover}
            addPlaylistAnchorRef={addPlaylistAnchorRef}
            handlePlaylistAdd={handlePlaylistAdd}
            spotify={spotify}
            shuffling={shuffling}
            handleQueueClicked={handleQueueClicked}/>
        </span>
      ) : (
        <span className={mobileClassName(isMobile, 'play-footer')}>
          <AlbumArtWrapper {...mobileProps} currentTrack={currentTrack} />
          <div className="play-footer_mobile-main-content">
            <div className="play-footer_extended-song-details-row">
              <SongDetails
                {...mobileProps}
                currentTrack={currentTrack}
                scrollProps={scrollProps} />
            </div>
            <div className={mobileClassName(isMobile, 'play-footer_playback-controls')}>
                <WrappedSeekBar
                  {...mobileProps}
                  duration={currState && currState.duration}
                  position={position}
                  disabled={!currState} />
                <SongControlsRow 
                  {...mobileProps}
                  handlePrevious={handlePrevious}
                  handleSkip={handleSkip}
                  handleToggle={handleToggle}
                  isPlaying={isPlaying} />
                <div className={mobileClassName(isMobile, 'play-footer_volume-row')}>
                  <AddToPlaylistButton 
                    {...mobileProps}
                    addPlaylistAnchorRef={addPlaylistAnchorRef}
                    handlePlaylistAdd={handlePlaylistAdd}/>
                  <ShowQueueButton 
                    {...mobileProps}
                    queuePopoverRef={queuePopoverRef}
                    handleQueueClicked={handleQueueClicked} />
                  <ShuffleButton 
                    {...mobileProps}
                    spotify={spotify}
                    shuffling={shuffling}/>
                </div>
            </div>
          </div>
        </span>
      )}
    </Fragment>
  );
}

export default PlayFooter;
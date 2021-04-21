import { useState, useCallback } from 'react';
import { useSpotifySdk } from './../../hooks/spotifyHooks';
import SeekBar from './SeekBar';
import VolumeSlider from './VolumeSlider';
import AddToPlaylistPopover from './../playlist/AddToPlaylistPopover';

import PlayArrowIcon from '@material-ui/icons/PlayArrow';
import PauseIcon from '@material-ui/icons/Pause';
import PlaylistAddIcon from '@material-ui/icons/PlaylistAdd';
import { IconButton } from '@material-ui/core';

import './FloatingToolbar.scss';

// should have: seek, volume, add to playlist, volume, pause/play
function FloatingToolbar(props) {
  const { duration, position } = props;
  const spotify = useSpotifySdk();
  const playerState = spotify.getPlayerState();

  const trackWindow = playerState && playerState.track_window;
  const currentTrack = trackWindow && trackWindow.current_track;

  const [ addToPlaylistOpen, setAddToPlaylistOpen ] = useState(false);
  const [ anchorRef, setAnchorRef ] = useState(null);

  const handlePlay = useCallback(() => spotify.togglePlay(), [spotify]);
  const handlePlaylistAdd = useCallback(() => setAddToPlaylistOpen(true), []);
  const closePopover = useCallback(() => setAddToPlaylistOpen(false), []);

  return (
    <div className="floating-toolbar">
      <AddToPlaylistPopover
        anchorEl={anchorRef}
        open={addToPlaylistOpen}
        onClose={closePopover}
        song={currentTrack} />
      <SeekBar duration={duration} position={position} disabled={!playerState} />
      <div className="controls-wrapper">
        <span className="">
          <VolumeSlider showIcon disabled={!playerState} />
          <div className="controls_small-buttons-wrapper">
            <IconButton onClick={handlePlay}>
              { spotify.isPlaying() ? (
                <PauseIcon className="controls_small-button"/>
              ) : (
                <PlayArrowIcon className="controls_small-button" />
              )}
            </IconButton>
            <IconButton
              onClick={handlePlaylistAdd}
              ref={el => setAnchorRef(el)} >
              <PlaylistAddIcon className="controls_small-button" />
            </IconButton>
          </div>
        </span>
      </div>
    </div>
  );
}

export default FloatingToolbar;
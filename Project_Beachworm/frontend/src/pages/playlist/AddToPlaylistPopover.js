import { useState, useEffect, useCallback, Fragment, memo } from 'react';
import Popover from '@material-ui/core/Popover';
import { Card, CardContent, Button } from '@material-ui/core';
import { getCurrentUser } from './../../api/userApi';
import { addSongToPlaylist } from './../../api/playlistApi';
import ScrollText from './../playbackControllers/ScrollText';
import EditPlaylistModal from './EditPlaylistModal';
import MuiAlert from '@material-ui/lab/Alert';
import Snackbar from '@material-ui/core/Snackbar';
import AddIcon from '@material-ui/icons/Add';
import './../playbackControllers/QueuePopover.css';
import './AddToPlaylistPopover.css';

const PopoverBody = ({playlistModalOpen, onEditPlaylistClose, updatePlaylists, 
  openPlaylistModal, playlists, onPlaylistAdd}) => {
  
  const scrollProps = useState({
    rampMillis: 500,
    decayMillis: 500,
    speed: 20,
  });

  return (
    <div className="playlist-popover">
      <div className="popover-section">
        <EditPlaylistModal
          open={playlistModalOpen}
          onClose={onEditPlaylistClose}
          onSubmit={updatePlaylists} />
        <span className="popover-section_header-wrapper">
          <h4 className="popover-section_header">Add to playlist</h4>
          <Button onClick={openPlaylistModal}
            className="btn-smaller"
            variant="outlined"
            size="small">
              create new
          </Button>
        </span>
        <ul className="popover-section_list">
          {playlists.map((playlist, index) => {
            return (
              <li key={index} className="popover-section_list-item">
                <Card variant="outlined">
                  <CardContent className="card-content">
                    <div className="card-content_text" >
                      <ScrollText className="card-content_line" {...scrollProps}>{playlist.title}</ScrollText>
                      <ScrollText className="card-content_line" {...scrollProps}>{playlist.description}</ScrollText>
                    </div>
                    <span className="card-content_controls">
                      <AddIcon
                        className="controls_add-icon"
                        onClick={() => onPlaylistAdd(playlist)} />
                    </span>
                  </CardContent>
                </Card>
              </li>
            )
          })}
        </ul>
      </div>
    </div>
  );
};

function AddToPlaylistPopover(props) {
  const { open, anchorEl, onClose, song } = props;

  const [playlistModalOpen, setPlaylistModalOpen] = useState(false);
  const [playlists, setPlaylists] = useState([]);
  const [snackbarState, setSnackbarState] = useState({ open: false, message: null, severity: null });

  const handleHideSnackbar = () => {
    setSnackbarState({
      ...snackbarState,
      open: false,
    });
  };

  const updatePlaylists = useCallback(async () => {
    await getCurrentUser().then(result => {
      setPlaylists(result.users_playlists);
      console.log('Updated playlists for popover');
    }, () => {
      console.log('Failed to get playlists for playlist popover. Closing popover early');
      onClose();
    })
  }, [onClose])

  useEffect(() => {
      updatePlaylists();
  }, [updatePlaylists]);

  const addToPlaylist = async (playlist) => {
    await addSongToPlaylist(playlist.id, song.id).then(() => {
      setSnackbarState({
        open: true,
        message: `Added "${song.name}" to "${playlist.title}"`,
        severity: 'success',
      });
      onClose();
      console.log(`Added "${song.name}" to playlist "${playlist.title}"`);
    }, () => {
      setSnackbarState({
        open: true,
        message: 'Failed to add song to playlist',
        severity: 'error',
      });
      console.log(`Failed to add song "${song.name}" to "${playlist.title}"`);
    });
    updatePlaylists();
  }

  const openPlaylistModal = useCallback(
    () => setPlaylistModalOpen(true), [setPlaylistModalOpen]
  );

  const [transformOrigin] = useState({
    vertical: 'bottom',
    horizontal: 'center',
  });

  return (
    <Fragment>
      <Popover
        id="playlist-popover"
        open={open}
        anchorReference="anchorPosition"
        anchorPosition={anchorEl && anchorEl.getBoundingClientRect()}
        transformOrigin={transformOrigin}
        onClose={onClose}
        disableRestoreFocus
      >
        <PopoverBody 
          playlistModalOpen={playlistModalOpen}
          onEditPlaylistClose={() => setPlaylistModalOpen(false)}
          updatePlaylists={() => updatePlaylists()}
          openPlaylistModal={openPlaylistModal}
          playlists={playlists}
          onPlaylistAdd={(playlist) => addToPlaylist(playlist)}/>
      </Popover>
      <Snackbar open={snackbarState.open} autoHideDuration={6000} onClose={handleHideSnackbar}>
          <MuiAlert
            onClose={handleHideSnackbar}
            severity={snackbarState.severity}
            elevation={6}
            variant="filled">
            {snackbarState.message}
          </MuiAlert>
        </Snackbar>
      </Fragment>
  );
}

export default memo(AddToPlaylistPopover);
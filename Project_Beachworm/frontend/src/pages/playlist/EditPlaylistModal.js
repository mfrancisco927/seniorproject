import { useState, useEffect, Fragment } from 'react';
import Modal from '@material-ui/core/Modal';
import { makeStyles } from '@material-ui/core/styles';
import Fade from '@material-ui/core/Fade';
import Backdrop from '@material-ui/core/Backdrop';
import TextField from '@material-ui/core/TextField';
import FormControlLabel from '@material-ui/core/FormControlLabel';
import Checkbox from '@material-ui/core/Checkbox';
import Button from '@material-ui/core/Button';
import MuiAlert from '@material-ui/lab/Alert';
import Snackbar from '@material-ui/core/Snackbar';
import { createPlaylist } from './../../api/userApi';
import { copyPlaylist, updatePlaylistSettings } from './../../api/playlistApi';
import { useAuth } from './../../hooks/authHooks';
import './EditPlaylistModal.scss';

function getModalStyle() {
  // centers the modal by centering
  const top = 50;
  const left = 50;

  return {
    top: `${top}%`,
    left: `${left}%`,
    transform: `translate(-${top}%, -${left}%)`,
  };
}

const useStyles = makeStyles((theme) => ({
  modalForm: {
    display: 'flex',
    justifyContent: 'center',
    flexDirection: 'column',
  },
  paper: {
    position: 'absolute',
    backgroundColor: theme.palette.background.paper,
    boxShadow: theme.shadows[5],
    padding: theme.spacing(2, 4, 3),
  },
  formEl: {
    margin: theme.spacing(1),
  },
  header: {
    overflowWrap: 'break-word',
  }
}));

function EditPlaylistModal(props) {
  const { open, onClose, playlist, onSubmit, defaultValues, copying } = props;
  const auth = useAuth();

  const defaultTitle = defaultValues ? defaultValues.title : 'Title';
  const defaultDescription = defaultValues ? defaultValues.description : 'Description';
  const defaultIsPublic = defaultValues ? defaultValues.isPublic : true;

  const [ formValues, setFormValues ] = useState({
    isPublic: playlist ? playlist.is_public : defaultIsPublic,
    title: playlist ? playlist.title : defaultTitle,
    description: playlist ? playlist.description : defaultDescription,
  });

  const [ snackbarState, setSnackbarState ] = useState({ open: false, message: null, severity: null });

  // resets form values when form is first opened
  useEffect(() => {
    if (open) {
      const priorTitle = copying ? playlist.title + ' (Copy)' : playlist && playlist.title;
      setFormValues({
        isPublic: playlist ? playlist.is_public : defaultIsPublic,
        title: priorTitle ? priorTitle : defaultTitle,
        description: playlist ? playlist.description : defaultDescription,
      });
    }
  }, [copying, defaultDescription, defaultIsPublic, defaultTitle, open, playlist])

  // getModalStyle is not a pure function, we roll the style only on the first render
  const classes = useStyles();
  const [ modalStyle ] = useState(getModalStyle);

  const handleCreateNewPlaylist = async (event) => {
    event.preventDefault();
    const { title, description, isPublic } = formValues;
    if (copying) {
      // copy existing playlist into new playlist
      await copyPlaylist(playlist.id, title, description, isPublic).then(() => {
        onSubmit && onSubmit();
        onClose && onClose();
        setSnackbarState({
          open: true,
          message: `Created a new playlist "${title}" based on "${playlist.title}"`,
          severity: 'success',
        });
      }, () => {
        setSnackbarState({
          open: true,
          message: `Failed to copy playlist "${playlist.title}"`,
          severity: 'error',
        });
      });
    } else if (playlist) {
      // update current playlist
      await updatePlaylistSettings(playlist.id, title, description, isPublic).then(newPlaylist => {
        onSubmit && onSubmit(newPlaylist);
        onClose && onClose();
        setSnackbarState({
          open: true,
          message: `Successfully updated playlist "${playlist.title}"`,
          severity: 'success',
        });
      }, () => {
        setSnackbarState({
          open: true,
          message: `Failed to update playlist "${playlist.title}"`,
          severity: 'error',
        });
      });
    } else {
      // create new playlist
      await createPlaylist(auth.id, title, description, isPublic).then(success => {
        console.log('Created new playlist', success.new_playlist);
        onSubmit && onSubmit();
        onClose && onClose();
        setSnackbarState({
          open: true,
          message: `Playlist "${success.new_playlist[0].title}" created!`,
          severity: 'success',
        });
      }, _reject => {
        console.log('Failed to create new playlist');
        setSnackbarState({
          open: true,
          message: 'Failed to create new playlist!',
          severity: 'error',
        });
      });
    }
  }

  const handleHideSnackbar = () => {
    setSnackbarState({
      ...snackbarState,
      open: false,
    });
  }

  let headerEl;

  if (playlist) {
    if (copying) {
      headerEl = <>Copying <em>{playlist.title}</em></>;
    } else {
      headerEl = <>Editing <em>{playlist.title}</em></>;
    }
  } else {
    headerEl = 'Create new playlist';
  }

  return (
    <Fragment>
      <Modal
      open={open}
      onClose={onClose}
      closeAfterTransition
      BackdropComponent={Backdrop}
      BackdropProps={{
        timeout: 250,
      }}>
        <Fade in={open}>
          <div
          style={modalStyle}
          className={["playlist-modal", classes.paper].join(' ')}>
            <h2 className={classes.header}>{headerEl}</h2>
            <form className={classes.modalForm} onSubmit={handleCreateNewPlaylist}>
              <TextField
                required
                className={classes.formEl}
                name="title"
                label="Playlist title"
                defaultValue={formValues.title}
                onChange={event => setFormValues({...formValues, title: event.target.value, })}
                variant="outlined" />
              <TextField
                required
                className={classes.formEl}
                name="description"
                label="Description"
                defaultValue={formValues.description}
                onChange={event => setFormValues({...formValues, description: event.target.value, })}
                variant="outlined" />
              <FormControlLabel
                className={classes.formEl}
                control={
                  <Checkbox
                    checked={formValues.isPublic}
                    onChange={event => setFormValues({...formValues, isPublic: event.target.checked, })}
                    name="isPublic"
                    color="primary"
                  />
                }
                label="Public playlist"
              />
              <Button type="submit" color="primary" variant="contained">Submit</Button>
            </form>
          </div>
        </Fade>
      </Modal>
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

export default EditPlaylistModal;
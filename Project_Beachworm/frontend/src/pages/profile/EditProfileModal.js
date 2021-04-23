import { Fragment, useState } from 'react';
import Modal from '@material-ui/core/Modal';
import { makeStyles } from '@material-ui/core/styles';
import Fade from '@material-ui/core/Fade';
import Backdrop from '@material-ui/core/Backdrop';
import Button from '@material-ui/core/Button';
import MuiAlert from '@material-ui/lab/Alert';
import Snackbar from '@material-ui/core/Snackbar';
import Dialog from '@material-ui/core/Dialog';
import DialogActions from '@material-ui/core/DialogActions';
import DialogContent from '@material-ui/core/DialogContent';
import DialogContentText from '@material-ui/core/DialogContentText';
import DialogTitle from '@material-ui/core/DialogTitle';
import { deactivateAccount } from './../../api/userApi';
import './EditProfileModal.css';

function EditProfileModal(props) {
  const { open, onClose, onLogout } = props;
  const [ snackbarState, setSnackbarState ] = useState({ open: false, message: null, severity: null });
  const [ confirmDeleteDialogOpen, setConfirmDeleteDialogOpen ] = useState(false);

  const showAlert = (message, severity) => {
    setSnackbarState({
      open: true,
      message: message,
      severity: severity,
    })
  };

  const handleHideSnackbar = () => {
    setSnackbarState({
      ...snackbarState,
      open: false,
    });
  };

  const handleDeactivate = async () => {
    console.log('Attempting to deactivate user account');
    await deactivateAccount().then(() => {
      showAlert('Successfully deactivated your account. Log in again to reactivate!', 'success');
      onLogout();
      console.log('Deactivated account');
    }, () => {
      console.log('Failed to deactivate account');
      showAlert('Failed to deactivate account. Call support!', 'error');
    });
  }

  const handleCloseDeleteDialog = () => setConfirmDeleteDialogOpen(false);

  const handleConfirmDelete = () => {
    handleCloseDeleteDialog();
    handleDeactivate();
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
  
  const classes = useStyles();

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
        <Fragment>
          <Dialog
          open={confirmDeleteDialogOpen}
          onClose={handleCloseDeleteDialog}
          aria-labelledby="alert-dialog-title"
          aria-describedby="alert-dialog-description">
            <DialogTitle id="alert-dialog-title">Really deactivate profile?</DialogTitle>
            <DialogContent>
              <DialogContentText id="alert-dialog-description">
                This will deactivate your account. Your entire profile, including playlists will be hidden
                from other users until you sign back in.
              </DialogContentText>
            </DialogContent>
            <DialogActions>
              <Button onClick={handleCloseDeleteDialog} color="primary" autoFocus>
                Cancel
              </Button>
              <Button onClick={handleConfirmDelete} color="primary">
                Delete
              </Button>
            </DialogActions>
          </Dialog>
          <Fade in={open}>
            <div
            className={["edit-profile-modal", classes.paper].join(' ')}>
              <h2 className={classes.header}>Profile settings</h2>
              <Button color="primary" variant="contained" onClick={() => setConfirmDeleteDialogOpen(true)}>
                Deactivate account
              </Button>
            </div>
          </Fade>
        </Fragment>
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

export default EditProfileModal;
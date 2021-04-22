import { useCallback, useState } from 'react';
import Menu from '@material-ui/core/Menu';
import MenuItem from '@material-ui/core/MenuItem';
import Typography from '@material-ui/core/Typography';
import AccountCircleIcon from '@material-ui/icons/AccountCircle';
import ExitToAppIcon from '@material-ui/icons/ExitToApp';
import SettingsIcon from '@material-ui/icons/Settings';
import { useHistory } from 'react-router-dom';
import { useSpotifySdk } from './../../hooks/spotifyHooks';
import { useAuth } from './../../hooks/authHooks';
import EditProfileModal from './EditProfileModal';

import './ProfileMenu.css';

function ProfileMenu({anchorEl, open, onClose, loggedIn}) {
  const history = useHistory();
  const auth = useAuth();
  const spotify = useSpotifySdk();

  const [editProfileModalOpen, setEditProfileMenuOpen] = useState(false);

  const openEditProfileModal = useCallback(() => {
    onClose();
    setEditProfileMenuOpen(true);
  }, [onClose]);
  const closeProfileModal = useCallback(() => setEditProfileMenuOpen(false), []);

  const redirectToProfile = useCallback(() => {
      onClose();
      closeProfileModal();
      history.push('/profile');
    }, [onClose, closeProfileModal, history]
  );

  const handleLogout = useCallback(() => {
    spotify.disconnect();
    spotify.clearAll();
    auth.signOut();
    closeProfileModal();
    history.push('/');
  }, [auth, closeProfileModal, history, spotify]);

  const handleSigninRedirect = useCallback(
    () => history.push('/landing'), 
    [history]
  );

  return (
    <Menu id="profile-menu"
    keepMounted
    anchorEl={anchorEl}
    open={open}
    onClose={onClose}
    anchorOrigin={{
      vertical: 'center',
      horizontal: 'center',
    }}
    transformOrigin={{
      vertical: 'top',
      horizontal: 'center',
    }}>
        <EditProfileModal
        open={editProfileModalOpen}
        onClose={closeProfileModal}
        onLogout={handleLogout}/>
        {loggedIn && (
          <MenuItem onClick={redirectToProfile}>
            <AccountCircleIcon className="profile-menu_icon" />
            <Typography className="profile-menu_text">My profile</Typography>
          </MenuItem>
        )}
        {loggedIn && (
          <MenuItem onClick={openEditProfileModal}>
            <SettingsIcon className="profile-menu_icon" />
            <Typography className="profile-menu_text">Account settings</Typography>
          </MenuItem>
        )}
        {loggedIn && (
          <MenuItem onClick={handleLogout}>
            <ExitToAppIcon className="profile-menu_icon" />
            <Typography className="profile-menu_text">Log out</Typography>
          </MenuItem>
        )}
        {!loggedIn && (
          <MenuItem onClick={handleSigninRedirect}>
            <Typography className="profile-menu_text">Sign in</Typography>
          </MenuItem>
        )}
    </Menu>
  )
}

export default ProfileMenu;
import { useHistory, useParams } from 'react-router-dom';
import { useCallback } from 'react';
import { useAuth } from './../../hooks/authHooks';
import { getProfile, getCurrentUser, followUser, unfollowUser } from './../../api/userApi';
import { Button } from '@material-ui/core';
import PersonIcon from '@material-ui/icons/Person';
import ClearIcon from '@material-ui/icons/Clear';
import SettingsIcon from '@material-ui/icons/Settings';
import VisibilityIcon from '@material-ui/icons/Visibility';
import VisibilityOffIcon from '@material-ui/icons/VisibilityOff';

import EditPlaylistModal from './../playlist/EditPlaylistModal';
import TabbedGallery from './TabbedGallery';

import './ProfilePage.css';
import { useEffect, useState, Fragment } from 'react';

const DEFAULT_IMAGE_URL = 'https://images-na.ssl-images-amazon.com/images/I/51Ib3jYSStL._AC_SY450_.jpg';

function ProfilePage(){
  const auth = useAuth();
  const history = useHistory();
  const [profileData, setProfileData] = useState({'playlists': [], 'following': [], 'followers': [], 'followedPlaylists': [],});
  const [dataLoaded, setDataLoaded] = useState(false);
  const [errorLoadingProfile, setErrorLoadingProfile] = useState(false);
  const [following, setFollowing] = useState(false);
  const [playlistModalState, setPlaylistModalState] = useState({open: false, playlist: null});
  const [ selectedTabIndex, setSelectedTabIndex ] = useState(0);
  const profileId = useParams().profileId || auth.id;
  const viewingSelf = Number(profileId) === auth.id;
  

  const updateTargetData = useCallback(async () => {
    if (!auth.id) {
      return; // can't run this until we are authorized
    }

    const loadProfileCallback = viewingSelf ? getCurrentUser : () => getProfile(profileId);
    let tempProfile = {'playlists': [], 'following': [], 'followers': [], 'followedPlaylists': [],};
    
    // first load profile data
    await loadProfileCallback().then(async (profileData) => {
      // if successful, request playlist data
      tempProfile = { ...profileData, 
        playlists: viewingSelf ? profileData.users_playlists : profileData.public_playlists,
        followedPlaylists: profileData.favorite_playlists,
      };
      setFollowing(tempProfile.followers.map(user => user.user_id).includes(auth.id));
      return Promise.resolve(profileData);
    }, reject => {
      // failed to get initial profile data
      if (reject.response.status === 404) {
        console.error('404 on target profile request.');
      }
      return Promise.reject(reject);
    })
    .catch(() => {
      setErrorLoadingProfile(true);
    }).finally(() => {
      setProfileData(tempProfile);
      setDataLoaded(true);
    });
    // console.log('Profile output', tempProfile);
  }, [auth.id, profileId, viewingSelf]);

  // when the profile being viewed changes, call the API and update the data
  useEffect(() => {
    updateTargetData();
  }, [updateTargetData]);

  const ImageSquare = (props) => {
    const { children, onClick, ...restProps } = props;
    return (
      <div className="gallery-item">
        <img className="gallery-item_img" alt="music" {...restProps} />
        <div className="gallery-item_overlay"  onClick={onClick}>
          <span className="gallery-item_overlay-text">
            {children}
          </span>
        </div>
      </div>
    );
  }

  const loadLikedSongsPlaylist = () => {
    // TODO: when playlist page is done, load up the liked songs within it here
  };

  const handlePlaylistClick = (playlist) => {
    history.push('/playlist', {
      playlist: playlist,
    });
  }

  const handleEditPlaylist = (playlist) => {
    setPlaylistModalState({open: true, playlist: playlist, });
  }

  const likedSongsElement = (
    <ImageSquare
    src={DEFAULT_IMAGE_URL}
    onClick={loadLikedSongsPlaylist}>
      {'Liked songs'}
    </ImageSquare>
  );

  const createNewPlaylistElement = (
    <ImageSquare
    src={DEFAULT_IMAGE_URL}
    onClick={() => setPlaylistModalState({open: true, playlist: null,})}>
      {'New playlist'}
    </ImageSquare>
  );

  const makePlaylistSquare = (playlist) => (
    <ImageSquare
      src={DEFAULT_IMAGE_URL}
      onClick={() => handlePlaylistClick(playlist)}>
      {playlist.title}
    </ImageSquare>
  );

  const tabDetails = {
    'playlists': {
      text: 'Playlists',
      tabItemCreationCallback: (playlist) => (
        // TODO: edit this one to also add a config button on the playlist that allows
        // the user to change name and visibility settings. maybe add some way to see
        // that it's public?
        viewingSelf ? (
          <div className="playlist-item__with-settings">
            {makePlaylistSquare(playlist)}
            <SettingsIcon
              className="playlist-item_settings-icon"
              onClick={() => handleEditPlaylist(playlist)} />
            {playlist.is_public ? (
              <VisibilityIcon className="playlist-item_visibility-icon playlist-item_visibility-icon__public"
              onClick={() => handleEditPlaylist(playlist)} />
            ) : (
              <VisibilityOffIcon className="playlist-item_visibility-icon playlist-item_visibility-icon__private"
              onClick={() => handleEditPlaylist(playlist)} />
            )}
          </div>
        ) : (
          makePlaylistSquare(playlist)
        )
      ),
      emptyTabText: !viewingSelf && 'No playlists available for this user!',
      prependItems: viewingSelf && (
        [likedSongsElement, createNewPlaylistElement]
      )
    },
    'followed-playlists': {
      text: 'Followed playlists',
      tabItemCreationCallback: (playlist) => (
        <ImageSquare
          src={DEFAULT_IMAGE_URL}
          onClick={() => handlePlaylistClick(playlist)}>
          {playlist.title}
        </ImageSquare>
      ),
      emptyTabText: (viewingSelf ? "You don't " : "This user doesn't ") + 'follow any playlists!',
    },
    'following': {
      text: 'Following',
      tabItemCreationCallback: (followedUser) => (
        <ImageSquare
        src={DEFAULT_IMAGE_URL}
        onClick={() => {
          setSelectedTabIndex(0);
          history.push(`/profile/${followedUser.user_id}`);
        }}>
          {followedUser.username}
        </ImageSquare>
      ),
      emptyTabText: (viewingSelf ? "You don't" : "This user doesn't") + ' follow anyone!',
    },
    'followers': {
      text: 'Followers',
      tabItemCreationCallback: (follower) => (
        <ImageSquare
        src={DEFAULT_IMAGE_URL}
        onClick={() => {
          setSelectedTabIndex(0);
          history.push(`/profile/${follower.user_id}`);
        }}>
          {follower.username}
        </ImageSquare>
      ),
      emptyTabText: (viewingSelf ? "You don't" : "This user doesn't") + ' have any followers!',
    },
  }

  const toggleFollow = async () => {
    if (following) {
      await unfollowUser(profileId).then(async _success => {
        console.log('Unfollowed user ' + profileId);
        await updateTargetData();
      }, reject => (console.log('Failed to unfollow user ' + profileId)));
    } else {
      await followUser(profileId).then(async _success => {
        console.log('Followed user ' + profileId);
        await updateTargetData();
      }, _reject => (console.log('Failed to follow user ' + profileId)));
    }
  };

  return (
    <div className='profile-page-wrapper'>
      {errorLoadingProfile && dataLoaded ? (
        <h1>Uh oh! The user you're looking for isn't here!</h1>
      ) : (
        <Fragment>
          <div className="profile-header_container">
            <PersonIcon className="profile-header_icon" />
            {viewingSelf ? (
              <h1 className="profile-header_username profile-header_username__self">{profileData.username}</h1>
            ) : (
              <div className="profile-header_interaction-wrapper">
                <h2 className="profile-header_username">{profileData.username}</h2>
                <Button className="profile-header_follow-button"
                onClick={toggleFollow}
                disableFocusRipple>
                  {following ? (
                    <Fragment>
                      <ClearIcon className="follow-button_x-icon" />
                      <span className="follow-button_text">
                        Unfollow
                      </span>
                    </Fragment>
                  ) : (
                    <span className="follow-button_text">
                      Follow
                    </span>
                  )}
                </Button>
              </div>
            )}
            
          </div>
          {viewingSelf && (
            <EditPlaylistModal
            open={playlistModalState.open}
            playlist={playlistModalState.playlist}
            onClose={() => setPlaylistModalState({...playlistModalState, open: false,})}
            onSubmit={() => updateTargetData()}/>
          )}
          <TabbedGallery
          selectedTabIndex={selectedTabIndex}
          setSelectedTabIndex={setSelectedTabIndex}
          tabDetails={tabDetails}>
            {[profileData.playlists, profileData.followedPlaylists, profileData.following, profileData.followers]}
          </TabbedGallery>
        </Fragment>
      )}
    </div>
  )
}

export default ProfilePage;
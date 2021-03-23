import { useHistory, useParams } from 'react-router-dom';
import { useCallback } from 'react';
import { useAuth } from './../../hooks/authHooks';
import { getProfile, getCurrentUser, followUser, unfollowUser, createPlaylist } from './../../api/userApi';
import { Button } from '@material-ui/core';
import PersonIcon from '@material-ui/icons/Person';
import ClearIcon from '@material-ui/icons/Clear';

import TabbedGallery from './TabbedGallery';

import './ProfilePage.css';
import { useEffect, useState, Fragment } from 'react';

function ProfilePage(){
  const auth = useAuth();
  const history = useHistory();
  const [profileData, setProfileData] = useState({'playlists': [], 'following': [], 'followers': []});
  const [dataLoaded, setDataLoaded] = useState(false);
  const [errorLoadingProfile, setErrorLoadingProfile] = useState(false);
  const [following, setFollowing] = useState(false);
  const profileId = useParams().profileId || auth.id;
  const viewingSelf = Number(profileId) === auth.id;

  const updateTargetData = useCallback(async () => {
    if (!auth.id) {
      return; // can't run this until we are authorized
    }

    const loadProfileCallback = viewingSelf ? getCurrentUser : () => getProfile(profileId);
    let tempProfile = {'playlists': [], 'following': [], 'followers': []};
    
    // first load profile data
    await loadProfileCallback().then(async (profileData) => {
      // if successful, request playlist data
      tempProfile = { ...profileData, 
        playlists: viewingSelf ? profileData.users_playlists : profileData.public_playlists,
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

  const handlePlaylistClick = (playlistId) => {
    console.log('Clicked playlist', playlistId);
  }

  const handleCreateNewPlaylist = async () => {
    const numPlaylists = profileData.playlists.length;
    const playlistName = prompt('Enter the playlist title.', 'Playlist' + numPlaylists);
    await createPlaylist(auth.id, playlistName, true).then(success => {
      console.log('Created new playlist', success.new_playlist);
      updateTargetData();
    }, reject => {
      console.log('Failed to create new playlist');
    });
  }

  const likedSongsElement = (
    <ImageSquare
    src="https://images-na.ssl-images-amazon.com/images/I/51Ib3jYSStL._AC_SY450_.jpg"
    onClick={loadLikedSongsPlaylist}>
      {'Liked songs'}
    </ImageSquare>
  );

  const createNewPlaylistElement = (
    <ImageSquare
    src="https://images-na.ssl-images-amazon.com/images/I/51Ib3jYSStL._AC_SY450_.jpg"
    onClick={handleCreateNewPlaylist}>
      {'New playlist'}
    </ImageSquare>
  );

  const tabDetails = {
    'playlists': {
      text: 'Playlists',
      tabItemCreationCallback: (playlist) => (
        // TODO: edit this one to also add a config button on the playlist that allows
        // the user to change name and visibility settings. maybe add some way to see
        // that it's public?
        <ImageSquare
          src="https://images-na.ssl-images-amazon.com/images/I/51Ib3jYSStL._AC_SY450_.jpg"
          onClick={() => handlePlaylistClick(playlist.id)}>
          {playlist.title}
        </ImageSquare>
      ),
      emptyTabText: !viewingSelf && 'No playlists available for this user!',
      prependItems: viewingSelf && (
        [likedSongsElement, createNewPlaylistElement]
      )
    },
    'following': {
      text: 'Following',
      tabItemCreationCallback: (followedUser) => (
        <ImageSquare
        src="https://images-na.ssl-images-amazon.com/images/I/51Ib3jYSStL._AC_SY450_.jpg"
        onClick={() => history.push(`/profile/${followedUser.user_id}`)}>
          {followedUser.username}
        </ImageSquare>
      ),
      emptyTabText: (viewingSelf ? "You don't" : "This user doesn't") + ' follow anyone!',
    },
    'followers': {
      text: 'Followers',
      tabItemCreationCallback: (follower) => (
        <ImageSquare
        src="https://images-na.ssl-images-amazon.com/images/I/51Ib3jYSStL._AC_SY450_.jpg"
        onClick={() => history.push(`/profile/${follower.user_id}`)}>
          {follower.username}
        </ImageSquare>
      ),
      emptyTabText: (viewingSelf ? "You don't" : "This user doesn't") + ' have any followers!',
    },
  }

  const toggleFollow = async () => {
    if (following) {
      await unfollowUser(profileId).then(success => {
        console.log('Unfollowed user ' + profileId);
        setFollowing(false);
      }, reject => (console.log('Failed to unfollow user ' + profileId)));
    } else {
      await followUser(profileId).then(success => {
        console.log('Followed user ' + profileId);
        setFollowing(true);
      }, reject => (console.log('Failed to follow user ' + profileId)));
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
          <TabbedGallery
          tabDetails={tabDetails}>
            {[profileData.playlists, profileData.following, profileData.followers]}
          </TabbedGallery>
        </Fragment>
      )}
    </div>
  )
}

export default ProfilePage;
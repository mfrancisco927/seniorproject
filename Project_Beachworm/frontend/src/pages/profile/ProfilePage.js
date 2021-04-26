import { useEffect, useState, Fragment } from 'react';
import { useHistory, useParams } from 'react-router-dom';
import { useCallback } from 'react';

import { useAuth } from './../../hooks/authHooks';
import { getProfile, getCurrentUser, followUser, unfollowUser, setProfileImage } from './../../api/userApi';

import EditPlaylistModal from './../playlist/EditPlaylistModal';
import TabbedGallery from './TabbedGallery';
import { createBlockWrapper, bemApplyModifier } from '../../util/bem-helpers';

import { Button } from '@material-ui/core';
import PersonIcon from '@material-ui/icons/Person';
import ClearIcon from '@material-ui/icons/Clear';
import SettingsIcon from '@material-ui/icons/Settings';
import VisibilityIcon from '@material-ui/icons/Visibility';
import VisibilityOffIcon from '@material-ui/icons/VisibilityOff';
import FileCopyIcon from '@material-ui/icons/FileCopy';
import AddAPhotoIcon from '@material-ui/icons/AddAPhoto';
import FavoriteIcon from '@material-ui/icons/Favorite';
import PostAddIcon from '@material-ui/icons/PostAdd';
import ListIcon from '@material-ui/icons/List';
import FaceIcon from '@material-ui/icons/Face';

import './ProfilePage.scss';

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


  // CSS BEM
  const profileBlock = createBlockWrapper('profile-header');
  const playlistTileBlock = createBlockWrapper('playlist-tile');
  const galleryItemBlock = createBlockWrapper('gallery-tile');
  const followBtnBlock = createBlockWrapper('follow-button');

  const updateTargetData = useCallback(async () => {
    if (!auth.id) {
      return; // can't run this until we are authorized
    }

    const loadProfileCallback = viewingSelf ? getCurrentUser : () => getProfile(profileId);
    let tempProfile = {'playlists': [], 'following': [], 'followers': [], 'followedPlaylists': [], };
    
    // first load profile data
    await loadProfileCallback().then(async (profileData) => {
      console.log(profileData)
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
    const imageEl = <img className={galleryItemBlock('img')} alt="music" {...restProps}/>;
    return (
      <Tile
      onClick={onClick}
      backgroundElement={imageEl}
      {...restProps} >
        {children}
      </Tile>
    );
  }

  const Tile = (props) => {
    const { children, backgroundElement, onClick } = props;
    return (
      <div className={galleryItemBlock('')}>
        {backgroundElement}
        <div className={galleryItemBlock('overlay')} onClick={onClick}>
          <span className={galleryItemBlock('overlay-text')}>
            {children}
          </span>
        </div>
      </div>
    );
  }

  const handlePlaylistClick = (playlist) => {
    history.push('/playlist', {
      playlist: playlist,
    });
  }

  const handleLikedSongsClick = () => {
    history.push('/playlist', {
      playlist: {
        id: 'liked',
        title: 'Liked Songs',
        description: 'All of your liked songs',
        owner_id: auth.id,
        is_public: false,
      },
    });
  }

  const handleEditPlaylist = (playlist) => {
    setPlaylistModalState({open: true, playlist: playlist, copying: false,});
  }

  const handleCopyPlaylist = (playlist) => {
    setPlaylistModalState({open: true, playlist: playlist, copying: true,});
  }

  const handleImageUpload = useCallback(async (image) => {
    await setProfileImage(profileId, image).then(() => {
      updateTargetData();
    })
  }, [profileId, updateTargetData]);

  const handleImageSubmit = useCallback((event) => {
    // console.log(event.target.files)
    if(event.target.files[0] !== null){
      handleImageUpload(event.target.files[0])
    }
    
  }, [handleImageUpload]);

  const likedSongsElement = (
    <Tile
    backgroundElement={(
      <FavoriteIcon className={galleryItemBlock('create-icon')}/>
    )}
    onClick={handleLikedSongsClick}>
      Liked songs
    </Tile>
  );

  const createNewPlaylistElement = (
    <Tile
    backgroundElement={(
      <PostAddIcon className={galleryItemBlock('liked-icon')}/>
    )}
    onClick={() => setPlaylistModalState({open: true, playlist: null,})}>
      New playlist
    </Tile>
  );

  const ProfileTile = ({profile}) => {
    const clickHandler = () => {
      setSelectedTabIndex(0);
      history.push(`/profile/${profile.user_id}`);
    };

    return profile.image ? (
      <ImageSquare
      src={`${process.env.REACT_APP_API_URL}/media/${profile.image}`}
      onClick={clickHandler}>
        {profile.username}
      </ImageSquare>
    ) : (
      <Tile
      backgroundElement={(
        <FaceIcon className={galleryItemBlock('profile-icon')}/>
      )}
      onClick={clickHandler}>
        {profile.username}
      </Tile>
    )
  };

  const PlaylistTile = ({playlist}) => (
    playlist.image ? (
      <ImageSquare
      src={`${process.env.REACT_APP_API_URL}/media/${playlist.image}`}
      onClick={() => handlePlaylistClick(playlist)}>
        {playlist.title}
      </ImageSquare>
    ) : (
      <Tile
      backgroundElement={(
        <ListIcon className={galleryItemBlock('liked-icon')}/>
      )}
      onClick={() => handlePlaylistClick(playlist)}>
        {playlist.title}
      </Tile>
    )
  );

  const tabDetails = {
    'playlists': {
      text: 'Playlists',
      tabItemCreationCallback: (playlist) => (
        // TODO: edit this one to also add a config button on the playlist that allows
        // the user to change name and visibility settings. maybe add some way to see
        // that it's public?
          <div className={bemApplyModifier('with-buttons', playlistTileBlock(''))}>
            {viewingSelf ? (
              <>
                <PlaylistTile playlist={playlist}/>
                <SettingsIcon
                  className={playlistTileBlock('settings-icon', 'control')}
                  onClick={() => handleEditPlaylist(playlist)} />
                {playlist.is_public ? (
                  <VisibilityIcon
                  className={[bemApplyModifier('public', playlistTileBlock('visibility-icon')), playlistTileBlock('control')].join(' ')}
                  onClick={() => handleEditPlaylist(playlist)} />
                ) : (
                  <VisibilityOffIcon
                  className={[bemApplyModifier('private', playlistTileBlock('visibility-icon')), playlistTileBlock('control')].join(' ')}
                  onClick={() => handleEditPlaylist(playlist)} />
                )}
                <FileCopyIcon
                className={[playlistTileBlock('copy-icon'), playlistTileBlock('control')].join(' ')}
                onClick={() => handleCopyPlaylist(playlist)} />
              </>
            ) : (
              <>
                <PlaylistTile playlist={playlist}/>
                <FileCopyIcon
                className={[playlistTileBlock('copy-icon'), playlistTileBlock('control')].join(' ')}
                onClick={() => handleCopyPlaylist(playlist)} />
              </>
            )
          }
        </div>
      ),
      emptyTabText: !viewingSelf && 'No playlists available for this user!',
      prependItems: viewingSelf && (
        [likedSongsElement, createNewPlaylistElement]
      )
    },
    'followed-playlists': {
      text: 'Followed playlists',
      tabItemCreationCallback: (playlist) => (<PlaylistTile playlist={playlist}/>),
      emptyTabText: (viewingSelf ? "You don't " : "This user doesn't ") + 'follow any playlists!',
    },
    'following': {
      text: 'Following',
      tabItemCreationCallback: (followee) => (<ProfileTile profile={followee} />),
      emptyTabText: (viewingSelf ? "You don't" : "This user doesn't") + ' follow anyone!',
    },
    'followers': {
      text: 'Followers',
      tabItemCreationCallback: (follower) => (<ProfileTile profile={follower} />),
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
    <div className={profileBlock('wrapper')}>
      {errorLoadingProfile && dataLoaded ? (
        <h1>Uh oh! The user you're looking for isn't here!</h1>
      ) : (
        <Fragment>
          <div className={profileBlock('container')}>
            <label className={profileBlock('profile-img-wrapper')}>
              {viewingSelf && (
                <Fragment>
                  <input
                    style={{display: 'none'}}
                    id="fileImage"
                    name="fileImage"
                    type="file"
                    accept="image/*"
                    onChange={handleImageSubmit}
                  />
                  <AddAPhotoIcon className={profileBlock('upload-icon')}/>
                </Fragment>
              )}
              <Fragment>
                {profileData.image ? 
                  (<img 
                    src={`${process.env.REACT_APP_API_URL}/media/${profileData.image}`}
                    height="175px"
                    width="auto"
                    max-width='300px'
                    alt={'Profile for ' + profileData.username}
                  />) : (
                    <PersonIcon className={profileBlock('icon')} />
                  )
                }
              </Fragment>
            </label>
            {viewingSelf ? (
              <h1 className={bemApplyModifier('self', profileBlock('username'))}>{profileData.username}</h1>
            ) : (
              <div className={profileBlock('interaction-wrapper')}>
                <h2 className={profileBlock('username')}>{profileData.username}</h2>
                <Button className={profileBlock('follow-button')}
                onClick={toggleFollow}
                disableFocusRipple>
                  {following ? (
                    <Fragment>
                      <ClearIcon className={followBtnBlock('x-icon')} />
                      <span className={followBtnBlock('text')}>
                        Unfollow
                      </span>
                    </Fragment>
                  ) : (
                    <span className={followBtnBlock('text')}>
                      Follow
                    </span>
                  )}
                </Button>
              </div>
            )}
          </div>
          <EditPlaylistModal
          open={playlistModalState.open}
          playlist={playlistModalState.playlist}
          copying={playlistModalState.copying}
          onClose={() => setPlaylistModalState({...playlistModalState, open: false,})}
          onSubmit={() => updateTargetData()}/>
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
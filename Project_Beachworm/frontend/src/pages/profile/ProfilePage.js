import { useHistory, useParams } from 'react-router-dom';
import { useAuth } from './../../hooks/authHooks';
import { getProfile, getCurrentUser, getPlaylists } from './../../api/userApi';
import PersonIcon from '@material-ui/icons/Person';

import TabbedGallery from './TabbedGallery';

import './ProfilePage.css';
import { useEffect, useState, Fragment } from 'react';

function ProfilePage(){
  const auth = useAuth();
  const history = useHistory();
  const [profileData, setProfileData] = useState({'playlists': [], 'following': [], 'followers': []});
  const [dataLoaded, setDataLoaded] = useState(false);
  const [errorLoadingProfile, setErrorLoadingProfile] = useState(false);
  let { profileId } = useParams();

  if (!profileId) {
    profileId = auth.id;
  }

  const viewingSelf = profileId === auth.id;

  // when the profile viewing changes, call the API and update the data
  useEffect(() => {
    const updateProfileData = async () => {
      const apiCallback = viewingSelf ? getCurrentUser : () => getProfile(profileId);
      let tempProfile = {'playlists': [], 'following': [], 'followers': []};
      
      // first load profile data
      await apiCallback().then(async (profileData) => {
        // if successful, request playlist data
        tempProfile = profileData;
        return await getPlaylists(profileId);
      }, reject => {
        // failed to get initial profile data
        if (reject.response.status === 404) {
          console.error('404 on initial profile request.');
        }
        return Promise.reject(reject);
      }).then(playlistData => {
        // successful in both profile and playlist data. yay!
        tempProfile.playlists = playlistData;
        setErrorLoadingProfile(false);
      }, reject => {
        // failed to get playlist data
        if (reject.response.status === 404) {
          console.error('404 on playlist request.');
        }
        return Promise.reject(reject);
      }).catch(() => {
        // setErrorLoadingProfile(true); // uncomment once endpoint is added
      }).finally(() => {
        
        // add in some fake playlist data for testing
        const tempPlaylist = {
          'name': 'Playlist Name!',
          'id': '23',
        };
        tempProfile.playlists = new Array(10).fill(tempPlaylist);

        // add in fake following and follower data for testing
        const tempFollower = {
          'id': 12,
          'username': 'Johnny Depp',
        };
        tempProfile.followers = new Array(12).fill(tempFollower);
        const tempFollowee = {
          'id': 15,
          'username': 'xX_quik_$c0pez_Xx',
        };
        tempProfile.following = new Array(13).fill(tempFollowee);

        setProfileData(tempProfile);
        setDataLoaded(true);
      });
      // console.log('Profile output', tempProfile);
    };

    updateProfileData();
  }, [profileId, viewingSelf]);

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

  const tabItemCreationCallbacks = {
    'Playlists': (playlist) => (
      <ImageSquare
        src="https://images-na.ssl-images-amazon.com/images/I/51Ib3jYSStL._AC_SY450_.jpg"
        onClick={() => console.log('Clicked a playlist!')}>
        {playlist.name}
      </ImageSquare>
    ),
    'Following': (followedUser) => (
      <ImageSquare
      src="https://images-na.ssl-images-amazon.com/images/I/51Ib3jYSStL._AC_SY450_.jpg"
      onClick={() => history.push(`/profile/${followedUser.id}`)}>
        {followedUser.username}
      </ImageSquare>
    ),
    'Followers': (follower) => (
      <ImageSquare
      src="https://images-na.ssl-images-amazon.com/images/I/51Ib3jYSStL._AC_SY450_.jpg"
      onClick={() => history.push(`/profile/${follower.id}`)}>
        {follower.username}
      </ImageSquare>
    ),
  };

  return (
    <div className='profile-page-wrapper'>
      {errorLoadingProfile && dataLoaded ? (
        <h1>Uh oh! The user you're looking for isn't here!</h1>
      ) : (
        <Fragment>
          <div className="profile-header_container">
            <PersonIcon className="profile-header_icon" />
            <h1 className="profile-header_username">{profileData.username}</h1>
          </div>
          <TabbedGallery tabItemCreationCallbacks={tabItemCreationCallbacks}>
            {[profileData.playlists, profileData.following, profileData.followers]}
          </TabbedGallery>
        </Fragment>
      )}
    </div>
  )
}

export default ProfilePage;
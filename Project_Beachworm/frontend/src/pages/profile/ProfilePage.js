import { useParams } from 'react-router-dom';
import { useAuth } from './../../hooks/authHooks';
import { getProfile, getCurrentUser, getPlaylists } from './../../api/userApi';
import PersonIcon from '@material-ui/icons/Person';

import TabbedGallery from './TabbedGallery';

import './ProfilePage.css';
import { useEffect, useState, Fragment } from 'react';

function ProfilePage(){
  const auth = useAuth();
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
        // add in some fake playlist data for testing
        tempProfile.playlists = [];
        return Promise.reject(reject);
      }).catch(() => {
        // setErrorLoadingProfile(true); // uncomment once endpoint is added
      }).finally(() => {
        setProfileData(tempProfile);
        setDataLoaded(true);
      });
      console.log('Profile output', tempProfile);
    };

    updateProfileData();
  }, [profileId, viewingSelf]);

  const ImageSquare = (props) => {
    const { children, ...restProps } = props;
    return (
      <image {...restProps}>
        {children}
      </image>
    );
  }

  const tabItemCreationCallbacks = {
    'Playlists': (playlist) => (
      <ImageSquare onClick={() => console.log('Clicked a playlist!')}>
        {playlist.name}
      </ImageSquare>
    ),
    'Following': (followedUser) => (
      <ImageSquare onClick={() => console.log('Clicked a followed user!')}>
        {followedUser.username}
      </ImageSquare>
    ),
    'Followers': (follower) => (
      <ImageSquare onClick={() => console.log('Clicked a follower!')}>
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
            {[profileData.playlists, profileData.following, profileData.following]}
          </TabbedGallery>
        </Fragment>
      )}
    </div>
  )
}

export default ProfilePage;
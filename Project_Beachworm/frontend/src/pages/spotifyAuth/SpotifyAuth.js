// import { useAuth } from './../../hooks/authHooks';
import { initiateSpotifyAuth, getSpotifyToken } from './../../api/authenticationApi';

const SpotifyAuth = () => {
// const auth = useAuth();

  const handleAuthClick = () => {
    initiateSpotifyAuth();
  };

  return (
    <div>
      <button onClick={handleAuthClick}>Authorize</button>
    </div>
  );
}

export default SpotifyAuth;
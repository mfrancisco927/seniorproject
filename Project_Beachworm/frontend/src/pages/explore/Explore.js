import { useEffect } from 'react';
import { useAuth } from './../../hooks/authHooks';
import { useSpotifySdk } from './../../hooks/spotifyHooks';
import { getRecommendations } from './../../api/recommendationApi';
import './Explore.css';

// wireframe: https://xd.adobe.com/view/8f7d9312-7adc-46a7-bf90-3947da38a70f-da2e/screen/564cc961-1abb-4956-b5a5-ff00ff1be308

const testQueueables = [
  {
    name: 'Lions!',
    song_id: '4OdGWYrATA6GKBCBjXkb2E',
  },
  {
    name: 'Onwards',
    song_id: '1K4WIx8NrOCdedkJwSCaAQ',
  },
  {
    name: 'New Chapter',
    song_id: '5Yn7hFF4Ap9tYZJOyyd7Ui',
  },
  {
    name: 'Everything Matters',
    song_id: '68ihyK7c8TRIkN5dFVnSYY',
  },
  {
    name: 'Ego',
    song_id: '5NoZA0PvEGP1kFkQv2vJTQ',
  },
  {
    name: 'Enter',
    song_id: '3VXtkBYkeDqVTECO1OOdXd',
  },
];

function Explore(props) {
    const auth = useAuth();
    const spotify = useSpotifySdk();

    // on mount, get the songs we need and add them to the queue.
    useEffect(() => {
      const onMount = async (data) => {
        console.log('Running onMount!', data);
        
        // const recommendedSongs = await getRecommendations(auth.user.id);
        const recommendedSongs = testQueueables; // REMOVE AFTER ENDPOINT TO GET OWN USER ID IMPLEMENTED INTO AUTH!
        const songsMapped = recommendedSongs.map(song => ({'id': song.song_id})); // remap "song_id" to "id"
        spotify.clearContextPlayQueue();
        spotify.play(songsMapped[0].id);
        spotify.addToContextPlayQueue(songsMapped.slice(1));
      };

      spotify.addOnReadyListeners({'Explore': onMount});
    }, []);

    const currState = spotify.getPlayerState();
    const trackWindow = currState && currState.track_window;
    const currentTrack = trackWindow && trackWindow.current_track;

    const {
      name,
      artists,
      album: {
        images: albumImages,
        name: albumName,
      },
    } = currentTrack ||
      { name: undefined, artists: undefined, album: { images: undefined, name: undefined, uri: undefined}, duration_ms: undefined};
  
    const albumImg = (
      albumImages ? (
        <img className="play-footer_album-art" src={albumImages[0].url} alt={albumName +' album art'} />
      ) : (
        <img className="play-footer_album-art" alt="" />
      )
    )

    return (
      <div className='playing-wrapper'>
        <button className='control-button prev-button' onClick={ () => {} }> Prev </button>

        {auth.user ? (
            <div className='playing-curr-song'>
              {albumImg}
              <p style={{textAlign:'center'}}>{name}</p>
              <p style={{textAlign:'center'}}>{artists.map(artist => artist.name).join(', ')}</p>
            </div>
          ) : (
            // todo: replace with song iframe for guest
            <div className='playing-curr-song playing-curr-song__guest'>
              {albumImg}
              <p style={{textAlign:'center'}}>{name}</p>
            </div>
        )}
        
        <button className='control-button next-button' onClick={spotify.skip}>
          Next
        </button>
      </div>
    );

}

export default Explore;

import { useEffect } from 'react';
import { useAuth } from './../../hooks/authHooks';
import { useSpotifySdk } from './../../hooks/spotifyHooks';
import { getRecommendations } from './../../api/recommendationApi';
import ArrowUpwardRoundedIcon from '@material-ui/icons/ArrowUpwardRounded';
import ArrowDownwardRoundedIcon from '@material-ui/icons/ArrowDownwardRounded';
import PlayCircleFilledRoundedIcon from '@material-ui/icons/PlayCircleFilledRounded';
import SkipNextRoundedIcon from '@material-ui/icons/SkipNextRounded';
import SkipPreviousRoundedIcon from '@material-ui/icons/SkipPreviousRounded';
import { IconButton } from '@material-ui/core';
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

    const { paused } = currState || false;

    const {
      name,
      artists,
      album: {
        images: albumImages,
        name: albumName,
      },
    } = currentTrack ||
      { name: undefined, artists: undefined, album: { images: undefined, name: undefined, uri: undefined}, duration_ms: undefined};
  
    const handlePlay = () => {
      spotify.togglePlay();
    }

    // TODO: maybe?
    const handlePrevious = () => {}

    const handleLike = () => {
      // hit like endpoint with current song
    };

    const handleDislike = () => {
      // hit dislike endpoint, maybe skip?
      handleSkip();
    };

    const handleSkip = () => {
      // TODO: logic to queue more songs if we're all out
      spotify.skip();
    }

    const albumImg = (
      albumImages ? (
        <img className="album-image_image" src={albumImages[0].url} alt={albumName +' album art'} />
      ) : (
        <img className="album-image_image" alt="" />
      )
    )

    // TODO: hovering bar with just favorite, pause/play, add to playlist

    return (
      <div className="playing-wrapper">
        <div className="control-row">
          <IconButton className="btn-control btn-next-previous btn-next-previous__previous" onClick={handlePrevious}>
            <SkipPreviousRoundedIcon className="btn-next-previous_icon" />
          </IconButton>
          <IconButton className="btn-control btn-like-dislike btn-like-dislike__dislike" onClick={handleDislike}>
            <ArrowDownwardRoundedIcon className="btn-like-dislike_icon" />
          </IconButton>
          {auth.user ? (
            currentTrack && (
              <div className="album-image_wrapper" onClick={handlePlay}>
                {albumImg}
                {paused && (
                  <IconButton className="play-song-overlay">
                    <PlayCircleFilledRoundedIcon className="resume_icon" />
                  </IconButton>
                )}
              </div>
            )) : (
              // todo: replace with song iframe for guest
              <div className='playing-curr-song playing-curr-song__guest'>
                {/* iframe here! */}
              </div>
          )}
          <IconButton className="btn-control btn-like-dislike btn-like-dislike__like" onClick={handleLike}>
            <ArrowUpwardRoundedIcon className="btn-like-dislike_icon" />
          </IconButton>
          <IconButton className="btn-control btn-next-previous btn-next-previous__next" onClick={handleSkip}>
            <SkipNextRoundedIcon className="btn-next-previous_icon" />
          </IconButton>
        </div>
        {auth.user && currentTrack && (
          <div className="info-row">
            <h2 style={{textAlign:'center'}}>{name}</h2>
            <h3 style={{textAlign:'center'}}>{artists.map(artist => artist.name).join(', ')}</h3>  
          </div>
        )}
      </div>
    );

}

export default Explore;

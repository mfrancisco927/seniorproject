import { useEffect } from 'react';
import { useAuth } from './../../hooks/authHooks';
import { useSpotifySdk } from './../../hooks/spotifyHooks';
import { getRecommendations } from './../../api/recommendationApi';

import FloatingToolbar from './../playbackControllers/FloatingToolbar';

import ArrowUpwardRoundedIcon from '@material-ui/icons/ArrowUpwardRounded';
import ArrowDownwardRoundedIcon from '@material-ui/icons/ArrowDownwardRounded';
import PlayCircleFilledRoundedIcon from '@material-ui/icons/PlayCircleFilledRounded';
import SkipNextRoundedIcon from '@material-ui/icons/SkipNextRounded';
import SkipPreviousRoundedIcon from '@material-ui/icons/SkipPreviousRounded';
import { IconButton } from '@material-ui/core';

import './Explore.css';

// wireframe: https://xd.adobe.com/view/8f7d9312-7adc-46a7-bf90-3947da38a70f-da2e/screen/564cc961-1abb-4956-b5a5-ff00ff1be308

function Explore() {
    const auth = useAuth();
    const spotify = useSpotifySdk();
    const CONTEXT_QUEUE_PREFIX = 'Explore';

    // on mount, get the songs we need and add them to the queue.
    useEffect(() => {
      const onMount = async (data) => {
        const contextQueue = spotify.getContextPlayQueue();
        const contextQueueName = contextQueue.name;
        // only if we're not already playing from an explore list, add some more
        if (!contextQueue || !contextQueueName || !contextQueueName.startsWith(CONTEXT_QUEUE_PREFIX)) {
          const getExploreSongs = async () => {
            return await getRecommendations().then(success => success.items);
          };

          console.log('Populating initial load of Explore songs');
          getExploreSongs().then(returnedSongs => {
            spotify.setContextPlayQueue({
              name: CONTEXT_QUEUE_PREFIX,
              songs: returnedSongs,
              getMoreSongs: getExploreSongs,
            });
          });
          
        }
      };

      // if the player is already ready, queue up and start.
      // if not (for example, if they load this webpage directly), add an onReady listener
      if (spotify.isPlayerReady()) {
        onMount();
      } else {
        spotify.addOnReadyListeners({'Explore': onMount});
      }
    }, []); // eslint-disable-line react-hooks/exhaustive-deps

    const currState = spotify.getPlayerState();
    const trackWindow = currState && currState.track_window;
    const currentTrack = trackWindow && trackWindow.current_track;
    // TODO: the small time between when we hit play and the song is actually loaded by
    // spotify, causes peek to flash the next song ahead of time. fix somehow? maybe store song in state here or in the hook?
    const songToShow = currentTrack || spotify.peekNextSong(); 
    const position = currState.position;
    const { paused } = currState || true;

    const {
      name,
      artists,
      album: {
        images: albumImages,
        name: albumName,
      },
      duration_ms,
    } = songToShow ||
      { name: undefined, artists: undefined, album: { images: undefined, name: undefined, uri: undefined}, duration_ms: undefined};
  
    const handlePlay = () => {
      spotify.togglePlay();
    }

    // TODO: maybe?
    const handlePrevious = () => {};

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
    };

    const albumImg = (
      albumImages ? (
        <img className="album-image_image" src={albumImages[0].url} alt={albumName +' album art'} />
      ) : (
        <img className="album-image_image" alt="" />
      )
    )

    // TODO: hovering bar with just favorite, pause/play, add to playlist

    return (
      <div className="explore-wrapper">
        <div className="playing-wrapper">
          <div className="control-row">
            <IconButton className="btn-control btn-next-previous btn-next-previous__previous" onClick={handlePrevious}>
              <SkipPreviousRoundedIcon className="btn-next-previous_icon" />
            </IconButton>
            <IconButton className="btn-control btn-like-dislike btn-like-dislike__dislike" onClick={handleDislike}>
              <ArrowDownwardRoundedIcon className="btn-like-dislike_icon" />
            </IconButton>
            {auth.user ? (
              <div className="album-image_wrapper" onClick={handlePlay}>
                {albumImg}
                {(paused || !trackWindow) && (
                  <IconButton className="play-song-overlay">
                    <PlayCircleFilledRoundedIcon className="resume_icon" />
                  </IconButton>
                )}
              </div>
            ) : (
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
          {auth.user && (
            <div className="info-row">
              <h2 style={{textAlign:'center'}}>{songToShow ? name : 'Loading song...'}</h2>
              <h3 style={{textAlign:'center'}}>{songToShow ? artists.map(artist => artist.name).join(', ') : 'Loading artist...'}</h3>  
            </div>
          )}
          </div>
        <div className="toolbar-wrapper">
          <FloatingToolbar
            duration={duration_ms}
            position={position} />
        </div>
      </div>
    );

}

export default Explore;

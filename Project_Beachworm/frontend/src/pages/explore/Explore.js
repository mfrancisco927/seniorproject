import { useEffect, useState, useRef, useCallback } from 'react';
import { useAuth } from './../../hooks/authHooks';
import { useSpotifySdk } from './../../hooks/spotifyHooks';
import { getRecommendations, getRecommendationsByGenre } from './../../api/recommendationApi';
import { likeSong, dislikeSong, unlikeSong, undislikeSong } from './../../api/songAPI';
import { getCurrentUser } from './../../api/userApi';

import FloatingToolbar from './../playbackControllers/FloatingToolbar';

import MuiAlert from '@material-ui/lab/Alert';
import Snackbar from '@material-ui/core/Snackbar';
import ArrowUpwardRoundedIcon from '@material-ui/icons/ArrowUpwardRounded';
import ArrowDownwardRoundedIcon from '@material-ui/icons/ArrowDownwardRounded';
import PlayCircleFilledRoundedIcon from '@material-ui/icons/PlayCircleFilledRounded';
import SkipNextRoundedIcon from '@material-ui/icons/SkipNextRounded';
import SkipPreviousRoundedIcon from '@material-ui/icons/SkipPreviousRounded';
import { Button, IconButton } from '@material-ui/core';

import './Explore.scss';

// wireframe: https://xd.adobe.com/view/8f7d9312-7adc-46a7-bf90-3947da38a70f-da2e/screen/564cc961-1abb-4956-b5a5-ff00ff1be308

function Explore() {
    const auth = useAuth();
    const spotify = useSpotifySdk();
    const CONTEXT_QUEUE_PREFIX = 'Explore';
    const likedSongs = useRef(null);
    const dislikedSongs = useRef(null);
    const ctxQueue = spotify.getContextPlayQueue();
    const contextQueueName = ctxQueue && ctxQueue.name;
    const signedIn = auth.id !== null;
    const [snackbarState, setSnackbarState] = useState({ open: false, message: null, severity: null });

    const loadLikeDislikes = useCallback(async () => {
      await getCurrentUser().then(success => {
        console.log('Refreshed like/dislike history for Explore');
        likedSongs.current = success.liked_songs.map(song => song.song_id);
        dislikedSongs.current = success.disliked_songs;
      }).catch(_reject => {
        console.log('Failed to refresh like/dislike history for Explore');
      })
    }, []);

    const loadExploreSongs = useCallback(async () => {
      const getExploreSongs = async () => {
        const endpointWrapper = signedIn ? (
          () => getRecommendations()
         ) : (
          () => getRecommendationsByGenre('pop')
        );
        return await endpointWrapper().then(success => success.items);
      };

      console.log('Populating initial load of Explore songs');
      return await getExploreSongs().then(returnedSongs => {
        let queuedSongs;
        if (signedIn) {
          queuedSongs = returnedSongs;
        } else {
          spotify.play(returnedSongs[0]);
          queuedSongs = returnedSongs.slice(1);
        }
        spotify.setContextPlayQueue({
          name: CONTEXT_QUEUE_PREFIX,
          songs: queuedSongs,
          getMoreSongs: getExploreSongs,
        });
        return Promise.resolve(returnedSongs);
      });
    }, [auth.id, signedIn]); // eslint-disable-line react-hooks/exhaustive-deps
    // disabled warning because we don't want to refresh this on spotify change

    // on mount, get the songs we need and add them to the queue.
    useEffect(() => {
      const onMount = async (_data) => {
        // only if we're not already playing from an explore list, add some more
        if (!contextQueueName || !contextQueueName.startsWith(CONTEXT_QUEUE_PREFIX)) {
          await loadExploreSongs();
        }
      };

      // if the player is already ready or we're not signed in, queue up and start.
      // if not (for example, if they load this webpage directly from a signed in session), add an onReady listener
      if (signedIn && !spotify.isPlayerReady) {
        spotify.addOnReadyListeners({'Explore': onMount});
      } else {
        onMount();
      }

      // load like and dislike lists
      if (signedIn) {
        loadLikeDislikes();
      }
    }, [loadLikeDislikes, loadExploreSongs]); // eslint-disable-line react-hooks/exhaustive-deps

    const currState = spotify.getPlayerState();
    const currentTrack = spotify.getCurrentTrack();
    // TODO: the small time between when we hit play and the song is actually loaded by
    // spotify, causes peek to flash the next song ahead of time. fix somehow? maybe store song in state here or in the hook?
    const songToShow = currentTrack || spotify.peekNextSong(); 
    const position = currState.position;
    const { paused } = currState || true;

    const {
      id: currentSongId,
      name,
      artists,
      album: {
        images: albumImages,
        name: albumName,
      },
      duration_ms,
    } = (signedIn && songToShow) ||
      { id:undefined, name: undefined, artists: undefined, album: { images: undefined, name: undefined, uri: undefined}, duration_ms: undefined};

    const alreadyLiked = likedSongs.current && likedSongs.current.includes(currentSongId);
    const alreadyDisliked = dislikedSongs.current && dislikedSongs.current.includes(currentSongId);

    const setAlertText = (message, severity) => {
      setSnackbarState({
        open: true,
        message: message,
        severity: severity,
      })
    }

    const handlePlay = () => {
      spotify.togglePlay();
    }

    const handlePrevious = async () => {
      spotify.playPrevious();
    };

    const handleLike = async () => {
      if (signedIn && currentSongId) {
        // toggle like status, so if already liked, remove the like
        if (!alreadyLiked) {
          await likeSong(auth.id, currentSongId).then(async _x => {
            console.log('Liked song ' + currentSongId);
            setAlertText('Added to liked songs!', 'success');
            await loadLikeDislikes();
          }, _error => {
            setAlertText('Failed to like song!', 'error');
            console.log('Failed to like song ' + currentSongId);
          });
        } else {
          await unlikeSong(auth.id, currentSongId).then(async _x => {
            console.log('Unliked song ' + currentSongId);
            setAlertText('Unliked song!', 'success');
            await loadLikeDislikes();
          }, _error => {
            setAlertText('Failed to unlike song!', 'error');
            console.log('Failed to unlike song ' + currentSongId);
          });
        }
      } else if (!signedIn) {
        setAlertText('Song controls are only available to logged-in users!', 'warning');
      }
    };

    const handleDislike = async () => {
      if (signedIn && currentSongId) {
        // toggle dislike status, so if already disliked, remove the dislike
        if (!alreadyDisliked) {
          await dislikeSong(auth.id, currentSongId).then(async _x => {
            console.log('Disliked song ' + currentSongId);
            setAlertText('Disliked song!', 'success');
            await loadLikeDislikes();
          }, _error => {
            setAlertText('Failed to dislike song!', 'error');
            console.log('Failed to dislike song ' + currentSongId);
          });
          handleSkip();
        } else {
          await undislikeSong(auth.id, currentSongId).then(async _x => {
            console.log('Undisliked song ' + currentSongId);
            setAlertText('Removed dislike from song!', 'success');
            await loadLikeDislikes();
          }, _error => {
            setAlertText('Failed to undislike song!', 'error');
            console.log('Failed to undislike song ' + currentSongId);
          });
        }
      } else if (!signedIn) {
        setAlertText('Song controls are only available to logged-in users!', 'warning');
      }
    };

    const handleSkip = async () => {
      await spotify.skip();
    };

    const handleReturnExplore = async () => {
      await loadExploreSongs(); // TODO: clear currently playing before loading, this currently lets current song stop
    };

    
    const handleHideSnackbar = () => {
      setSnackbarState({
        ...snackbarState,
        open: false,
      });
    };

    const albumImg = (
      albumImages ? (
        <img className="album-image_image" src={albumImages[0].url} alt={albumName +' album art'} />
      ) : (
        <img className="album-image_image" alt="" />
      )
    );

    return (
      <div className="explore-wrapper">
        <Snackbar open={snackbarState.open} autoHideDuration={3000} onClose={handleHideSnackbar}>
          <MuiAlert
            onClose={handleHideSnackbar}
            severity={snackbarState.severity}
            elevation={6}
            variant="filled">
            {snackbarState.message}
          </MuiAlert>
        </Snackbar>
        <div className="playing-wrapper">
          {(contextQueueName && contextQueueName !== CONTEXT_QUEUE_PREFIX) && (
            <div className="return-explore-wrapper">
              <Button className="btn-return-explore" onClick={handleReturnExplore}>
                Return to Standard Explore
              </Button>
            </div>
          )}
          <div className="control-row">
            <IconButton className="btn-control btn-next-previous btn-next-previous__previous" onClick={handlePrevious}>
              <SkipPreviousRoundedIcon className="btn-next-previous_icon" />
            </IconButton>
            <IconButton className={"btn-control btn-like-dislike btn-like-dislike__dislike" + (alreadyDisliked ? " btn-like-dislike__already-disliked" : "")}
            onClick={handleDislike}>
              <ArrowDownwardRoundedIcon className="btn-like-dislike_icon" />
            </IconButton>
            {signedIn ? (
              <div className="album-image_wrapper" onClick={handlePlay}>
                {albumImg}
                {(paused || !currState.track_window) && (
                  <IconButton className="play-song-overlay">
                    <PlayCircleFilledRoundedIcon className="resume_icon" />
                  </IconButton>
                )}
              </div>
            ) : (
                <div className='playing-curr-song playing-curr-song__guest'>
                  <iframe {...{src: currentTrack && `https://open.spotify.com/embed/track/${currentTrack.id}`}}
                  title="Spotify guest player"
                  width="300"
                  height="380"
                  frameBorder="0"
                  allowtransparency="true"
                  allow="encrypted-media" />
                </div>
            )}
            <IconButton className={"btn-control btn-like-dislike btn-like-dislike__like" + (alreadyLiked ? " btn-like-dislike__already-liked" : "")}
            onClick={handleLike}>
              <ArrowUpwardRoundedIcon className="btn-like-dislike_icon" />
            </IconButton>
            <IconButton className="btn-control btn-next-previous btn-next-previous__next"
            onClick={handleSkip}>
              <SkipNextRoundedIcon className="btn-next-previous_icon" />
            </IconButton>
          </div>
          {signedIn && (
            <div className="info-row">
              <h2 className="info-row_song" style={{textAlign:'center'}}>{songToShow ? name : 'Loading song...'}</h2>
              <h3 className="info-row_artist" style={{textAlign:'center'}}>{songToShow ? artists.map(artist => artist.name).join(', ') : 'Loading artist...'}</h3>  
            </div>
          )}
          </div>
        {signedIn && (
          <div className="toolbar-wrapper">
            <FloatingToolbar
              duration={duration_ms}
              position={position} />
          </div>
        )}
      </div>
    );

}

export default Explore;

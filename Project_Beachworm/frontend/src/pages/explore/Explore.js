import { useEffect, useState, useRef, useCallback, memo } from 'react';
import { useAuth } from './../../hooks/authHooks';
import { useSpotifySdk } from './../../hooks/spotifyHooks';
import { getRecommendations, getRecommendationsByGenre } from './../../api/recommendationApi';
import { likeSong, dislikeSong, unlikeSong, undislikeSong } from './../../api/songAPI';
import { getCurrentUser } from './../../api/userApi';
import { useWindowDimensions, SCREEN_SIZE } from './../../hooks/responsiveHooks';
import { createBlockWrapper, bemConditionalModifier, bemApplyModifier,
  bemKnownModifierApplier, removeDupesWithNesting } from '../../util/bem-helpers';

import FloatingToolbar from './../playbackControllers/FloatingToolbar';
import ScrollText from './../playbackControllers/ScrollText';

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

const CONTEXT_QUEUE_PREFIX = 'Explore';

// BEM
const block = createBlockWrapper('explore');
  
const controlRowBlock = createBlockWrapper('control-row');
const infoRowBlock = createBlockWrapper('info-row');
const returnExploreBlock = createBlockWrapper('return-explore');
const albumImageBlock = createBlockWrapper('album-img');

const alreadyLikedModifier = bemConditionalModifier('already-liked');
const alreadyDislikedModifier = bemConditionalModifier('already-disliked');

const AlbumImg = ({albumImages, albumName}) => (
  albumImages ? (
    <img className="album-image_image" src={albumImages[0].url} alt={albumName +' album art'} />
  ) : (
    <img className="album-image_image" alt="" />
  )
);

const SignedInSongElement = ({spotify, paused, currState, albumImages, albumName}) => {
  const handlePlay = useCallback(() => spotify.togglePlay(), [spotify]);

  return (
    <div className={albumImageBlock('wrapper')} onClick={handlePlay}>
      <AlbumImg albumImages={albumImages} albumName={albumName} />
      {(paused || !currState.track_window) && (
        <IconButton className={albumImageBlock('play-song-overlay')}>
          <PlayCircleFilledRoundedIcon className={albumImageBlock('resume_icon')} />
        </IconButton>
      )}
    </div>
  )
};

const PreviousButton = ({spotify}) => {
  const handlePrevious = useCallback(() => spotify.playPrevious(), [spotify]);

  return (
    <IconButton
      className={controlRowBlock('btn-control', bemApplyModifier('previous', 'btn-next-previous'))}
      onClick={handlePrevious}>
      <SkipPreviousRoundedIcon className={controlRowBlock('btn-next-previous_icon')} />
    </IconButton>
  );
};

const DislikeButton = ({handleDislike, alreadyDisliked}) => (
  <IconButton
  className={controlRowBlock('btn-control', bemApplyModifier('dislike', 'btn-like-dislike'), alreadyDislikedModifier(alreadyDisliked, 'btn-like-dislike'))}
  onClick={handleDislike}>
    <ArrowDownwardRoundedIcon className={controlRowBlock('btn-like-dislike_icon')} />
  </IconButton>
);

const LikeButton = ({handleLike, alreadyLiked}) => (
  <IconButton 
  className={controlRowBlock('btn-control', bemApplyModifier('like', 'btn-like-dislike'), alreadyLikedModifier(alreadyLiked, 'btn-like-dislike'))}
  onClick={handleLike}>
    <ArrowUpwardRoundedIcon className={controlRowBlock('btn-like-dislike_icon')} />
  </IconButton>
);

const SkipButton = ({spotify}) => {
  const handleSkip = useCallback(() => {
    const skip = async () => spotify.skip();
    skip();
  }, [spotify]);

  return (
    <IconButton 
    className={controlRowBlock('btn-control', bemApplyModifier('next', 'btn-next-previous'))}
    onClick={handleSkip}>
      <SkipNextRoundedIcon className={controlRowBlock('btn-next-previous_icon')} />
    </IconButton>
  );
};

const GuestSongElement = ({trackId, isMobile}) => {
  return <div className='playing-curr-song playing-curr-song__guest'>
    <iframe {...{src: trackId && `https://open.spotify.com/embed/track/${trackId}`}}
    title="Spotify guest player"
    width={isMobile ? '250' : '300'}
    height={isMobile ? '330' : '380'}
    frameBorder="0"
    allowtransparency="true"
    allow="encrypted-media" />
  </div>
};

// todo: figure out why this is remounting. somewhere in the hierarchy below Explore and above this, something is remounting, so we 
// unmount and remount the iframe every resize
const MemoizedGuestSong = memo(GuestSongElement);

const CurrentSongFrame = ({trackId, paused, currState, signedIn, albumImages, albumName, songToShow, spotify, isMobile}) => (
  signedIn ? (
    <SignedInSongElement spotify={spotify} paused={paused} currState={currState} albumImages={albumImages} albumName={albumName} songToShow={songToShow} />
  ) : (
    <MemoizedGuestSong currState={currState} albumImages={albumImages} albumName={albumName} trackId={trackId} isMobile={isMobile} />
  )
);

const SongTextInfo = ({signedIn, songToShow}) => {
  const { name, artists } = songToShow || {};

  const songText = songToShow ? name : 'Loading song...';
  const artistText = songToShow ? artists.map(artist => artist.name).join(', ') : 'Loading artist...';

  const scrollTextProps = {
    rampMillis: 500,
    decayMillis: 1000,
    speed: 30,
  };

  return signedIn ? (
    <div className={infoRowBlock('wrapper')}>
      <h2 className={infoRowBlock('song')} style={{textAlign:'center'}}>
        <ScrollText {...scrollTextProps}>
          {songText}
        </ScrollText>
      </h2>
      <h3 className={infoRowBlock('artist')} style={{textAlign:'center'}}>
        <ScrollText {...scrollTextProps}>
          {artistText}
        </ScrollText>
      </h3>  
    </div>
  ) : null;
};

const ReturnToExploreButton = ({handleReturnExplore, spotify}) => {
  const ctxQueue = spotify.getContextPlayQueue();
  const contextQueueName = ctxQueue && ctxQueue.name;

  return (contextQueueName !== CONTEXT_QUEUE_PREFIX) ? (
    <div className={returnExploreBlock('wrapper')}>
      <Button className={returnExploreBlock('button')} onClick={handleReturnExplore}>
        Return to Standard Explore
      </Button>
    </div>
  ) : null;
};

const FullSizePlayingWrapperContent = ({trackId, spotify, paused, currState, signedIn, albumImages, albumName, isMobile,
  handleLike, handleDislike, alreadyLiked, alreadyDisliked, songToShow}) => {
  const mobileModifier = bemKnownModifierApplier('mobile', isMobile);
  const controlRowWrapperClass = mobileModifier(controlRowBlock('wrapper'));

  return (
    <>
      <div className={controlRowWrapperClass}>
        <PreviousButton spotify={spotify} />
        <DislikeButton handleDislike={handleDislike} alreadyDisliked={alreadyDisliked} />
        <CurrentSongFrame trackId={trackId} paused={paused} currState={currState} signedIn={signedIn} albumImages={albumImages} albumName={albumName}
          spotify={spotify} isMobile={isMobile} />
        <LikeButton handleLike={handleLike} alreadyLiked={alreadyLiked} />
        <SkipButton spotify={spotify} />
      </div>
      <SongTextInfo signedIn={signedIn} songToShow={songToShow} />
    </>
  );
};

const MobilePlayingWrapperContent = ({trackId, spotify, paused, currState, signedIn, albumImages, albumName, handleLike,
  handleDislike, alreadyLiked, alreadyDisliked, isMobile, songToShow}) => {
    
  const mobileModifier = bemKnownModifierApplier('mobile', isMobile);
  const controlRowWrapperClass = mobileModifier(controlRowBlock('wrapper'));

  return (
    <>
      <div className={controlRowWrapperClass}>
        <div className={controlRowBlock('mobile-song-row')}>
          <PreviousButton spotify={spotify} />
          <CurrentSongFrame trackId={trackId} paused={paused} currState={currState} signedIn={signedIn} albumImages={albumImages} albumName={albumName}
            spotify={spotify} isMobile={isMobile} />
          <SkipButton spotify={spotify} />
        </div>
        <div className={controlRowBlock('mobile-like-row')}>
          <DislikeButton handleDislike={handleDislike} alreadyDisliked={alreadyDisliked} />
          <SongTextInfo signedIn={signedIn} songToShow={songToShow} />
          <LikeButton handleLike={handleLike} alreadyLiked={alreadyLiked} />
        </div>
      </div>
    </>
  );
};

const PlayingWrapper = (props) => {
  const mobileModifier = bemKnownModifierApplier('mobile', props.isMobile);
  const guestModifier = bemKnownModifierApplier('guest', !props.signedIn);
  const playingWrapperClass = block('playing-wrapper');

  return (
    <div className={removeDupesWithNesting([
      mobileModifier(playingWrapperClass), 
      guestModifier(playingWrapperClass)
    ]).join(' ')}>
      <ReturnToExploreButton spotify={props.spotify} handleReturnExplore={props.handleReturnExplore} />
      {!props.isMobile ? (
        <FullSizePlayingWrapperContent {...props} />
      ) : (
        <MobilePlayingWrapperContent {...props} />
      )}
    </div>
  );
};

const MemoizedPlayingWrapper = memo(PlayingWrapper);

function Explore() {
  const auth = useAuth();
  const spotify = useSpotifySdk();
  const { width } = useWindowDimensions();
  const isMobile = width <= SCREEN_SIZE.SMALL;
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
    });
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
        await spotify.skip();
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

  // TODO: clear currently playing before loading, this currently lets current song stop
  const handleReturnExplore = useCallback(() => loadExploreSongs(), [loadExploreSongs]);

  const handleHideSnackbar = useCallback(() => {
    setSnackbarState({
      ...snackbarState,
      open: false,
    });
  }, [snackbarState]);

  const mobileModifier = bemKnownModifierApplier('mobile', isMobile);

  return (
    <div className={block('explore-wrapper')}>
      <MemoizedPlayingWrapper trackId={currentTrack && currentTrack.id} alreadyLiked={alreadyLiked} alreadyDisliked={alreadyDisliked}
      spotify={spotify} handleReturnExplore={handleReturnExplore} handleDislike={handleDislike} handleLike={handleLike} isMobile={isMobile}
      albumImages={albumImages} albumName={albumName} songToShow={songToShow} paused={paused} signedIn={signedIn} currState={currState} />
      {signedIn && (
        <div className={mobileModifier(block('toolbar-wrapper'))}>
          <FloatingToolbar
            duration={duration_ms}
            position={position} />
        </div>
      )}
      <Snackbar open={snackbarState.open} autoHideDuration={3000} onClose={handleHideSnackbar}>
        <MuiAlert
          onClose={handleHideSnackbar}
          severity={snackbarState.severity}
          elevation={6}
          variant="filled">
          {snackbarState.message}
        </MuiAlert>
      </Snackbar>
    </div>
  );
}

export default Explore;

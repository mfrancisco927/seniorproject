import { useState, useEffect, Fragment } from 'react';
import { useSpotifySdk } from './../../hooks/spotifyHooks';
import ScrollText from './ScrollText';

import './PlayFooter.css';

function PlayFooter() {
  const spotify = useSpotifySdk();
  const [isPlaying, setPlaying] = useState(false);
  const [currState, setCurrState] = useState({});
  const [prevAlbumUri, setPrevAlbumUri] = useState(null);
  const [albumImg, setAlbumImg] = useState(null);

  const {
    name,
    artists,
    album: {
      images: albumImages,
      name: albumName,
      uri: albumUri
    },
    duration_ms,
  } = currState.track_window ? 
    currState.track_window.current_track :
    { name: undefined, artists: undefined, album: { images: undefined, name: undefined, uri: undefined}, duration_ms: undefined};

  if (albumUri && prevAlbumUri !== albumUri) {
    console.log(albumImages);
    console.log(albumUri);
    setPrevAlbumUri(albumUri);
    setAlbumImg(<img className="play-footer_album-art" src={albumImages[1].url} alt={albumName +' album art'} />);
  } 
  // console.log(currState.track_window);

  useEffect(() => {
    spotify.addStateListener({'PlayFooter': setCurrState});
  }, []);

  const scrollProps = {
    rampMillis: 500,
    decayMillis: 500,
    speed: 45,
  }

  return (
    <span className='play-footer'>
      <div className="play-footer_album-art-wrapper">
        {albumImg}
      </div>
      <div className="play-footer_song-info">
        {name && <Fragment>
          <p className="nowPlayingText">Now Playing</p>
          <ScrollText {...scrollProps}>{name}</ScrollText>
          <ScrollText {...scrollProps}>{artists.map(artist => artist.name).join(', ')}</ScrollText>
        </Fragment>}
      </div>
      <div className="play-footer_playback-controls">

      </div>

      <button className='control-button' onClick={() => {
        spotify.play('1l0EaTTnZy9PuhYzWUzB8e');
        setPlaying(true);
      }}>Play sample song</button>
      <button className='control-button'>Prev</button>
      <button className='control-button' onClick={() => {
        isPlaying ? spotify.pause() : spotify.resume();
        setPlaying(!isPlaying);
      }}>
        {isPlaying ? 'Pause' : 'Play'}
      </button>
      <button className='control-button'>Next</button>
    </span>
  );
}

export default PlayFooter;
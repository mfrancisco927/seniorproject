import { useState } from 'react';
import { useSpotifySdk } from './../../hooks/spotifyHooks';

import './PlayFooter.css';

function PlayFooter() {
  const spotify = useSpotifySdk();
  const [isPlaying, setPlaying] = useState(true);

  return (
    <div className='play-footer'>
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
    </div>
  );
}

export default PlayFooter;
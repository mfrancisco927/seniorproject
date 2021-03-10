import './PlayFooter.css';
import { useState } from 'react';


function PlayFooter() {
  const [isPlaying, setPlaying] = useState(true)

  return (
    <div className='play-footer'>
      <button className='control-button'>Prev</button>
      <button className='control-button' onClick={() => {
        setPlaying(!isPlaying)}
      }>
        {isPlaying ? 'Pause' : 'Play'}
      </button>
      <button className='control-button'>Next</button>
    </div>
  );
}

export default PlayFooter;
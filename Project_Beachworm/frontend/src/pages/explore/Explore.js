import React, {useState, useEffect } from 'react';
import { useAuth } from './../../hooks/authHooks';
import { useSpotifySdk } from './../../hooks/spotifyHooks';
import './Explore.css';

// wireframe: https://xd.adobe.com/view/8f7d9312-7adc-46a7-bf90-3947da38a70f-da2e/screen/564cc961-1abb-4956-b5a5-ff00ff1be308

function Explore(props) {
    const auth = useAuth();
    const spotify = useSpotifySdk();

    const { songList } = props;
    const [ songIndex, setSongIndex ] = useState(0);
    const [ currSong, setCurrSong ] = useState(songList[0]);

    const changeSong = (increment) => {
      console.log(songList);
      if (increment + songIndex >= 0 && increment + songIndex < songList.length){
        setSongIndex(songIndex + increment);
      }
    }

    useEffect( () => {
      setCurrSong(songList[songIndex])
    }, [songIndex, songList])

    return (
      <div className='playing-wrapper'>
        <button className='control-button prev-button' onClick={ () => changeSong(-1) }> Prev </button>

        {auth.user ? (
            <div className='playing-curr-song'>
              <img src={currSong.img} style={{height:'300px',width:'300px'}} alt='current song' />
              <p style={{textAlign:'center'}}>{currSong.name + ' [SIGNED IN]'}</p>
            </div>
          ) : (
            // todo: replace with song iframe
            <div className='playing-curr-song playing-curr-song__guest'>
              <img src={currSong.img} style={{height:'300px',width:'300px'}} alt='current song' />
              <p style={{textAlign:'center'}}>{currSong.name + ' [GUEST]'}</p>
            </div>
        )}
        
        <button className='control-button next-button' onClick={ () => changeSong(1) }> Next </button>
      </div>
    );

}

export default Explore;

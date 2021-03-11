import React, {useState, useEffect } from 'react';
import { useAuth } from './../../hooks/authHooks';
import './Explore.css';

function Explore(props) {
    const auth = useAuth();
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

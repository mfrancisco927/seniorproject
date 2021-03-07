import React, {useState, useEffect } from 'react';

function CurrPlaying(props) {

    const { songList } = props;
    const [ songIndex, setSongIndex ] = useState(0);
    const [ currSong, setCurrSong ] = useState(songList[0]);

    const changeSong = (increment) => {
        
        console.log(songList)
        if(increment + songIndex >= 0 && increment + songIndex < songList.length){
            setSongIndex(songIndex + increment);
        }
        
    }

    useEffect( () => {
        setCurrSong(songList[songIndex])
    },[songIndex, songList])


    return (
        <div className='playing-wrapper'>
            <button className='control-button prev-button' onClick={ () => changeSong(-1) }> Prev </button>

            <div className='playing-curr-song'>
                <img src={currSong.img} style={{height:'300px',width:'300px'}} alt='ayy' />
                <p style={{textAlign:'center'}}>{currSong.name}</p>
            </div>

            <button className='control-button next-button' onClick={ () => changeSong(1) }> Next </button>
        </div>
    )

}

export default CurrPlaying;

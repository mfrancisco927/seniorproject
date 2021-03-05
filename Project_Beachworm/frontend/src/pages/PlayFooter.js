import {useState} from 'react';

function PlayFooter() {

    const [playOrPause, setPlayOrPause] = useState('Play')

    return (

        <div>
        <div className='play-footer'>
            
            <button className='control-button'>Prev</button>
            <button className='control-button' onClick={() => {
                console.log(playOrPause);
                playOrPause === 'Play' ? setPlayOrPause('Pause') :  setPlayOrPause('Play')}
                } > {playOrPause} </button>
            <button className='control-button'>Next</button>
        </div>
            <h1>testtesttest</h1>
        </div>
    )

}

export default PlayFooter;
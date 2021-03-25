import React , { Component, useState, useEffect, useHistory, Fragment, useRef } from 'react';
import './MainPage.css';
import ArrowBackIosIcon from '@material-ui/icons/ArrowBackIos';
import ArrowForwardIosIcon from '@material-ui/icons/ArrowForwardIos';
import { useAuth } from './../../hooks/authHooks';
import { useSpotifySdk } from './../../hooks/spotifyHooks';
import { getRecommendations } from './../../api/recommendationApi';
import LoadingImage from '../loading.svg';
import useRadioLoaders from '../../hooks/radioLoaders';

const testingItems = [
  {
  'img':'https://upload.wikimedia.org/wikipedia/en/c/c4/Floral_Green.jpg',
  'name': 'TEST 1! RUN SERVER FOR LIVE DATA',
  song_id: '7BJny7nQN5bY4EeGVU3kj6',
  },
  {
    'img':'https://media.pitchfork.com/photos/5a71df0d85ed77242d8f1252/1:1/w_320/jpegmafiaveteran.jpg',
    'name': 'TEST 2! RUN SERVER FOR LIVE DATA',
    song_id: '03n2zDv0TXbH2q9XpzYpqY',
  },
  {
    'img':'https://i.pinimg.com/originals/78/6e/a3/786ea3d49748ab17966e4301f0f73bb6.jpg',
    'name': 'TEST 3! RUN SERVER FOR LIVE DATA',
    song_id: '5imSIRUGtX4aeRRA81UakE',
  },    
  {
    'img':'https://i.pinimg.com/originals/78/6e/a3/786ea3d49748ab17966e4301f0f73bb6.jpg',
    'name': 'TEST 3! RUN SERVER FOR LIVE DATA',
    song_id: '3VXtkBYkeDqVTECO1OOdXd',
  },    
  {
    'img':'https://i.pinimg.com/originals/78/6e/a3/786ea3d49748ab17966e4301f0f73bb6.jpg',
    'name': 'TEST 3! RUN SERVER FOR LIVE DATA',
    song_id: '3VXtkBYkeDqVTECO1OOdXd',
  }
];

function MainPage(props) {

  const spotify = useSpotifySdk();
  const auth = useAuth();
  const loader = useRadioLoaders();
  const [data, setData] = useState(testingItems);
  const [loaded, setLoaded] = useState(false)

  useEffect( () =>{
    getRecommendations().then( (data) => {
          console.log(data);
          setData(data);
          setLoaded(true);
        }
      );
  }, [auth.id])

  return (
    <Fragment>
      { !loaded ? 
        (<img src={LoadingImage} alt='Loading'/> ):
        (
          <div>
          <SongRow title='Recommended Tracks' 
            getItems={ () => data.tracks}
            onItemClick={song => loader.loadSongRadio(song)}
            getImageCallback={ (item) => item.album.images[0].url}
            getTitle={ (item) => { return (<h2>{item.name}</h2>)}}            
            getSubtitle={ (item) => {return (<h3>{item.artists.map(artist => artist.name).join(', ')}</h3>) }}
            />
          <SongRow title='Recommended Artists' 
            getItems={ () => data.artists}
            spotify={spotify}
            onItemClick={artist => loader.loadArtistRadio(artist)}
            getImageCallback={ (item) => item.images[0].url}
            getTitle={ (item) => { return <h3>{item.name}</h3> }}
            getSubtitle={ (item) => ''}
            />
          <SongRow title='Recommended Genres' 
            getItems={ () => data.genres}
            spotify={spotify}
            onItemClick={item => {
              loader.loadGenreRadio({
                id: item
              })
            }}
            getImageCallback={ item => 'https://media.pitchfork.com/photos/5a71df0d85ed77242d8f1252/1:1/w_320/jpegmafiaveteran.jpg'
            }
            getTitle={ (item) => {return (<h2>{item}</h2>)}}
            getSubtitle={ item => ''}
              />
                  
          </div>
        )
      }
      </Fragment>
    
    );
}

function SongRow(props){


  const {title, getImageCallback, getItems, getTitle, getSubtitle, onItemClick} = props;
  const songBoxRef = useRef({});
  const MAX_ITEMS_SHOWN = 10;
  
  const moveRow = (direction) => {
    if(direction === 'left'){
      songBoxRef.current.scrollLeft -= 200;
    }else if(direction === 'right'){        
      songBoxRef.current.scrollLeft += 200;
    }
  }

    return (
      <div className='group-wrapper' >
          <div className='group-header'><h2>{title}</h2></div>
              <div className='songs-buttons-wrapper'>
                  <ArrowBackIosIcon fontSize='large' className='pan pan-left' onClick={() => moveRow('left')} />
                <div className='songs-wrapper' ref={songBoxRef}>
                { 
                  getItems().slice(0,Math.min(MAX_ITEMS_SHOWN, getItems().length)).map((item) => {
                    return (
                      <div className='song-wrapper'  onClick={ () => onItemClick(item)}>
                          <img className='song-img' src={getImageCallback(item)} alt='hello!'/> 
                          { getTitle(item) }
                          { getSubtitle(item) }
                      </div>
                    );
                  })
                }
                </div>
                <ArrowForwardIosIcon fontSize='large' className='pan pan-right' onClick={() => moveRow('right')}/>

              
            </div>
        </div>
    );

}

export default MainPage;

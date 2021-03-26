import React , { Component, useState, useEffect, useHistory, Fragment, useRef } from 'react';
import './MainPage.css';
import ArrowBackIosIcon from '@material-ui/icons/ArrowBackIos';
import ArrowForwardIosIcon from '@material-ui/icons/ArrowForwardIos';
import { useAuth } from './../../hooks/authHooks';
import { useSpotifySdk } from './../../hooks/spotifyHooks';
import { getHomeRecommendations } from './../../api/recommendationApi';
import LoadingImage from '../loading.svg';
import useRadioLoaders from '../../hooks/radioLoaders';

function MainPage(props) {

  
  const auth = useAuth();
  const loader = useRadioLoaders();
  const [data, setData] = useState({});
  const [loaded, setLoaded] = useState(false)

  useEffect( () =>{
    getHomeRecommendations().then( (data) => {
          console.log(data);
          setData(data);
          setLoaded(true);
        }
      );
  }, [auth.id])

  return (
    <Fragment>
      <div className='song-page-wrapper'>
      { !loaded ? 
        (<div className='loading-img-wrapper'><img className='loading-img' src={LoadingImage} alt='Loading'/></div> ):
        (
          <div>
          <SongRow title='Recommended Tracks' 
            getItems={ () => data.tracks}
            onItemClick={song => loader.loadSongRadio(song)}
            getImageCallback={(item) => {
              if(item.album.images.length != 0){
                  return item.album.images[0].url;
                }else{
                  return 'https://media.pitchfork.com/photos/5a71df0d85ed77242d8f1252/1:1/w_320/jpegmafiaveteran.jpg';
              }
            }
            }
            getTitle={ (item) => { return (<h2 className='artist-title'>{item.name}</h2>)}}            
            getSubtitle={ (item) => {return (<h3 className='artist-subtitle' >{item.artists.map(artist => artist.name).join(', ')}</h3>) }}
            />
          <SongRow title='Recommended Artists' 
            getItems={ () => data.artists}
            onItemClick={artist => loader.loadArtistRadio(artist)}
            getImageCallback={(item) => {
              if(item.images.length != 0){
                  return item.images[0].url;
                }else{
                  return 'https://media.pitchfork.com/photos/5a71df0d85ed77242d8f1252/1:1/w_320/jpegmafiaveteran.jpg';
              }
            }
          } 
            getTitle={ (item) => { return <h2 className='artist-title'>{item.name}</h2> }}
            getSubtitle={ (item) => ''}
            />
          <SongRow title='Recommended Genres' 
            getItems={ () => data.genres}
            onItemClick={item => {
              loader.loadGenreRadio({
                id: item
              })
            }}
            getImageCallback={ item => 'https://media.pitchfork.com/photos/5a71df0d85ed77242d8f1252/1:1/w_320/jpegmafiaveteran.jpg'}
            getTitle={ (item) => {return (<h2 className='artist-title'>{item}</h2>)}}
            getSubtitle={ item => ''}
              />
                  
          </div>
        )
      }
      </div>
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
    checkForOverflow();
  }

  const checkForOverflow = () => {
    
    const {scrollWidth, clientWidth} = songBoxRef.current;
    const hasOverFlow = scrollWidth > clientWidth;

  }

  //TODO: Implement Disabling the buttons when they cant be used

  useEffect( () => {
    checkForOverflow();
  }, [])

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

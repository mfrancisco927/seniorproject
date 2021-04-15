import { useState, useEffect, Fragment, useRef } from 'react';
import './MainPage.css';
import ArrowBackIosIcon from '@material-ui/icons/ArrowBackIos';
import ArrowForwardIosIcon from '@material-ui/icons/ArrowForwardIos';
import { getHomeRecommendations } from './../../api/recommendationApi';
import LoadingImage from '../loading.svg';
import useRadioLoaders from '../../hooks/radioLoaders';
import { useWindowDimensions, SCREEN_SIZE } from './../../hooks/responsiveHooks';
import debounce from 'lodash.debounce'
import Values from 'values.js'


function MainPage() {
  const loader = useRadioLoaders();
  const [data, setData] = useState({});
  const [loaded, setLoaded] = useState(false);
  const { width } = useWindowDimensions();
  const isMobile = width <= SCREEN_SIZE.SMALL;
  const possStyles = {
    colors: [ '#d60d0d', '#2348ad', '#8f138d', '#0ec23e', '#e69020'
            ],
    fonts : [ 'Caveat','Sofia','Bebas Neue'
            ]
            //, 'Abril Fatface', 'Bebas Neue', 'Teko', 'Recursive'
  }

  useEffect(() => {
    getHomeRecommendations().then((data) => {
        console.log(`Retrieved ${data.tracks.length} tracks, ${data.artists.length} artists, ${data.genres.length} genres for home page`);
        setData(data);
        setLoaded(true);
      }
    );
  }, [])
  const getStyleRandom = () =>{
    let randColorString = possStyles.colors[Math.floor( Math.random() * possStyles.colors.length)]
    let colorObj = new Values(randColorString);
    let shadedColor = colorObj.shade(70).hexString();
    console.log(shadedColor);
    let cssString = `linear-gradient(150deg, ${randColorString} 30%, ${shadedColor})`
    
    let font = possStyles.fonts[Math.floor( Math.random() * possStyles.colors.length)];
    let returned = {'background':cssString, 'font-family': font}

    return returned;
  }

  return !isMobile? (
    <Fragment>
      <link rel="stylesheet" href={`https://fonts.googleapis.com/css?family=${possStyles.fonts.join('|')}`}></link>
      <div className='song-page-wrapper'>
      { !loaded ? 
        (<div className='loading-img-wrapper'><img className='loading-img' src={LoadingImage} alt='Loading'/></div> ):
        (
          <div>
          <SongRow title='Recommended Tracks' 
            getItems={ () => data.tracks}
            onItemClick={song => loader.loadSongRadio(song)}
            getImageCallback={(item) => {
              if(item.album.images.length !== 0){
                return <img src={item.album.images[0].url} className='song-img' alt='Track goes here' />
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
              if(item.images.length !== 0){
                return <img src={item.images[0].url} className='song-img' alt='artist goes here' />
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
            onItemClick={item => loader.loadGenreRadio({
              id: item,
              name: item,
            })}
            getImageCallback={ (item) => {
              return <div className='song-img genre-box' style={getStyleRandom()}>{item}</div>
            }}
            getTitle={ (item) => {return (<h2 className='artist-title'>{item}</h2>)}}
            getSubtitle={ item => ''}
              />
                  
          </div>
        )
      }
      </div>
      </Fragment>
    
    ) : (
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
              if(item.album.images.length !== 0){
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
              if(item.images.length !== 0){
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
            onItemClick={item => loader.loadGenreRadio({
              id: item,
              name: item,
            })}
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
  const { width } = useWindowDimensions();
  const isMobile = width <= SCREEN_SIZE.SMALL;

  const [hasOverflow, setHasOverflow] = useState(true);
  const [canScrollLeft, setcanScrollLeft] = useState(true);
  const [canScrollRight, setcanScrollRight] = useState(true); 


  const moveRow = (distance) => {
    songBoxRef.current.scrollBy({ left: distance, behavior: 'smooth' });
  }

  const checkForScrollPosition = () => {
    const {scrollLeft, scrollWidth, clientWidth} = songBoxRef.current;
    setcanScrollLeft(scrollLeft > 0);
    setcanScrollRight(scrollLeft !== scrollWidth - clientWidth);
    console.log(songBoxRef.current, `Can scroll Left? ${canScrollLeft}, Can scroll Right? ${canScrollRight}`)
  }

  const checkForOverflow = () => {
    const {scrollWidth, clientWidth} = songBoxRef.current;
    const overflow = scrollWidth > clientWidth;

    setHasOverflow(overflow)
    console.log(songBoxRef.current)
    console.log(hasOverflow)
    if(!overflow){
      setcanScrollLeft(false);
      setcanScrollRight(false);
    }else{
      checkForScrollPosition(); 
    }
  }

  //TODO: BUG -> For some reason, on the initial render, things just aren't set to the correct values
  //             aka: hasOverflow, canScrollRight, and canScrollLeft are all false on initial render

  useEffect( () => {


    songBoxRef.current.addEventListener(
      'scroll',
      debounce(
        checkForScrollPosition,
        25
      ),
    )    
    songBoxRef.current.addEventListener(
      'load',
      checkForOverflow,
    )
  }, [])

  useEffect( () => {
    checkForOverflow();
  }, [width])

    return !isMobile? (
      <div className='group-wrapper' >
          <div className='group-header'><h2>{title}</h2></div>
              <div className='songs-buttons-wrapper'>
                  <ArrowBackIosIcon fontSize='large' className='pan pan-left' color={!canScrollLeft? 'disabled' : ''} onClick={() => moveRow(width * -0.3)} />
                <div className='songs-wrapper' ref={songBoxRef}>
                { 
                  getItems().slice(0,Math.min(MAX_ITEMS_SHOWN, getItems().length)).map((item, index) => {
                    return (
                      <div className='song-wrapper' key={`wrapper-index-${index}`} onClick={ () => onItemClick(item)}>
                          { getImageCallback(item) }
                          { getTitle(item) }
                          { getSubtitle(item) }
                      </div>
                    );
                  })
                }
                </div>
                <ArrowForwardIosIcon fontSize='large' disabled={!canScrollRight} color={!canScrollRight? 'disabled' : ''}  className='pan pan-right' onClick={() => moveRow(width * 0.3)}/>

              
            </div>
        </div>
    ) : 
    ( 
      <div className='group-wrapper-sm' >
          <div className='group-header-sm'><h2>{title}</h2></div>
                <div className='songs-wrapper-sm' ref={songBoxRef}>
                { 
                  getItems().slice(0,Math.min(MAX_ITEMS_SHOWN, getItems().length)).map((item, index) => {
                    return (
                      <div className='song-wrapper-sm' key={`wrapper-index-${index}`} onClick={ () => onItemClick(item)}>
                          <img className='song-img-sm' src={getImageCallback(item)} alt='hello!'/> 
                          { getTitle(item) }
                          { getSubtitle(item) }
                      </div>
                    );
                  })
                }
  
            

              
            </div>
        </div>
    );

}

export default MainPage;

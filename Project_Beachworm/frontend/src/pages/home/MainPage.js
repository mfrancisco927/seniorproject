import { useState, useEffect, Fragment, useRef, useCallback } from 'react';
import './MainPage.scss';
import ArrowBackIosIcon from '@material-ui/icons/ArrowBackIos';
import ArrowForwardIosIcon from '@material-ui/icons/ArrowForwardIos';
import { getHomeRecommendations } from './../../api/recommendationApi';
import LoadingImage from '../loading.svg';
import useRadioLoaders from '../../hooks/radioLoaders';
import { useWindowDimensions, SCREEN_SIZE } from './../../hooks/responsiveHooks';
import debounce from 'lodash.debounce'
import Values from 'values.js'
import { createBlockWrapper, bemKnownModifierApplier } from './../../util/bem-helpers';


function MainPage() {
  const loader = useRadioLoaders();
  const [data, setData] = useState({});
  const [loaded, setLoaded] = useState(false);
  const { width } = useWindowDimensions();
  const isMobile = width <= SCREEN_SIZE.SMALL;
  const [possStyles] = useState({
    colors: [ '#d60d0d', '#2348ad', '#8f138d', '#0ec23e', '#e69020', '#2199b8', '#d41597', '#ffe600'],
    fonts : [ 'Caveat','Sofia','Bebas Neue', 'Abril Fatface', 'Bebas Neue', 'Teko', 'Recursive','Antonia']
  });
  const [genreStyles, setGenreStyles] = useState([]);
  const mobileModifier = bemKnownModifierApplier('small', isMobile);

  const getStyleRandom = useCallback((numberOfGenres) =>{
    let tempList = []
    for(let i = 0; i < numberOfGenres; i++){
      let randColorString = possStyles.colors[Math.floor( Math.random() * possStyles.colors.length)]
      let colorObj = new Values(randColorString);
      let colorString, angle, shadedColor;
      if(Math.random() > .5){
        shadedColor = colorObj.shade(70).hexString();
        angle = '150deg'
      }else{
        shadedColor = colorObj.tint(50).hexString();
        angle = '60deg'
      }
      colorString = `linear-gradient(${angle}, ${randColorString} 30%, ${shadedColor})`
      
      let font = possStyles.fonts[Math.floor( Math.random() * possStyles.fonts.length)];
      tempList.push({'background': colorString, 'font-family': font})
    }
    tempList.unshift( {
      'background': `linear-gradient(60deg, #a8a8a8 30%, #707070)`, 
      'font-family': 'Antonio'
    })

    setGenreStyles(tempList)
  }, [possStyles.colors, possStyles.fonts]);

  useEffect(() => {
    getHomeRecommendations().then((data) => {
        console.log(`Retrieved ${data.tracks.length} tracks, ${data.artists.length} artists, ${data.genres.length} genres for home page`);
        setData(data);
        getStyleRandom(data.genres.length)
        setLoaded(true);
      }
    );
  }, [getStyleRandom])

  const recTileBlock = createBlockWrapper('recommendation-tile');
  const recTileVisualClass = mobileModifier(recTileBlock('visual'));

  return (
    <Fragment>
      <link rel="stylesheet" href={`https://fonts.googleapis.com/css?family=${possStyles.fonts.join('|')}`}></link>
      <div className='song-page-wrapper'>
      { !loaded ? (
        <div className='loading-img-wrapper'>
          <img className='loading-img' src={LoadingImage} alt='Loading'/>
        </div>
      ) : (
        <div>
          <SongRow title='Recommended Tracks' 
            getItems={ () => data.tracks}
            onItemClick={song => loader.loadSongRadio(song)}
            getImageCallback={(item) => (item.album.images.length !== 0 ? (
              <img src={item.album.images[0].url} className={recTileVisualClass} alt={item.name + ' by ' + item.artists.map(artist => artist.name).join(', ')} />
            ) : (
              <div className={recTileVisualClass} style={genreStyles[0]}>Image Missing :/</div>
            ))}
            getTitle={(item) => (<h2 className='artist-title'>{item.name}</h2>)}            
            getSubtitle={(item) => (<h3 className='artist-subtitle' >{item.artists.map(artist => artist.name).join(', ')}</h3>)}
            />
          <SongRow title='Recommended Artists' 
            getItems={ () => data.artists}
            onItemClick={artist => loader.loadArtistRadio(artist)}
            getImageCallback={(item) => (item.images.length !== 0 ? (
              <img src={item.images[0].url} className={recTileVisualClass} alt={item.name} />
            ) : (
              <div className={recTileVisualClass} style={genreStyles[0]}>Image Missing :/</div>
            ))}
            getTitle={ (item) => { return <h2 className='artist-title'>{item.name}</h2> }}
            />
          <SongRow title='Recommended Genres' 
            getItems={ () => data.genres}
            onItemClick={item => loader.loadGenreRadio({
              id: item,
              name: item,
            })}
            getImageCallback={(item, index) => (
              <div className={[recTileVisualClass, mobileModifier('genre-tile')].join(' ')} style={genreStyles[index + 1]}>{item}</div>
            )}
            getTitle={ (item) => {return (<h2 className='artist-title'>{item}</h2>)}}
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
  // const [hasOverflow, setHasOverflow] = useState(false);
  const [canScrollLeft, setcanScrollLeft] = useState(false);
  const [canScrollRight, setcanScrollRight] = useState(false);
  const mobileModifier = bemKnownModifierApplier('small', isMobile);

  // //CHANGES FOR SCROLL TESTING
  // if(title === 'Recommended Genres'){
  //   MAX_ITEMS_SHOWN = 2;
  // }

  const moveRow = (distance) => {
    songBoxRef.current.scrollBy({ left: distance, behavior: 'smooth' });
  }

  const checkForScrollPosition = () => {
    const {scrollLeft, scrollWidth, clientWidth} = songBoxRef.current;
    setcanScrollLeft(scrollLeft > 0);
    setcanScrollRight(scrollLeft !== scrollWidth - clientWidth);
    // console.log(songBoxRef.current, `Can scroll Left? ${canScrollLeft}, Can scroll Right? ${canScrollRight}`)
  }

  const checkForOverflow = useCallback(() => {
    const {scrollWidth, clientWidth} = songBoxRef.current;
    const overflow = scrollWidth > clientWidth;

    // console.log(songBoxRef.current, `has overflow? ${overflow}`)
    if(overflow){
      checkForScrollPosition(); 
    }
  }, []);

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
  }, [])

  useEffect( () => {
    // console.log('scroll width changed: ', songBoxRef.current, ' client width: ', songBoxRef.current.clientWidth, ' scroll width: ', songBoxRef.current.scrollWidth )
    checkForOverflow();
  }, [checkForOverflow, songBoxRef.current.clientWidth, songBoxRef.current.scrollWidth])

  const recGroupBlock = createBlockWrapper('recommendation-group');
  const recTileBlock = createBlockWrapper('recommendation-tile');

  const rowImages = getItems().slice(0,Math.min(MAX_ITEMS_SHOWN, getItems().length)).map((item, index) => {
    return (
      <div
      className={mobileModifier(recTileBlock('tile-content-wrapper'))}
      key={`wrapper-index-${index}`}
      onClick={ () => onItemClick(item)}>
          { getImageCallback && getImageCallback(item, index) }
          { getTitle && getTitle(item) }
          { getSubtitle && getSubtitle(item) }
      </div>
    );
  });

  return (
    <div className={mobileModifier('group-wrapper')} >
      <div className={mobileModifier('group-header')}>
        <h2>{title}</h2>
      </div>
      <div className={recGroupBlock('buttons-wrapper')}>
        {!isMobile && (
          <ArrowBackIosIcon
          fontSize='large'
          className='pan pan-left'
          color={!canScrollLeft? 'disabled' : ''}
          onClick={() => moveRow(width * -0.3)} />
        )}
        <div className={mobileModifier(recGroupBlock('tiles-wrapper'))} ref={songBoxRef}>
          {rowImages}
        </div>
        {!isMobile && (
          <ArrowForwardIosIcon
          fontSize='large'
          disabled={!canScrollRight}
          color={!canScrollRight? 'disabled' : ''} 
          className='pan pan-right'
          onClick={() => moveRow(width * 0.3)}/>
        )}
      </div>
    </div>
  );
}

export default MainPage;

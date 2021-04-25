import { Fragment, useRef, useState, useEffect } from 'react';
import { useAuth } from './../../hooks/authHooks';
import LoadingImage from '../loading.svg';
import useRadioLoaders from '../../hooks/radioLoaders';
import PersonIcon from '@material-ui/icons/Person';
// import { useWindowDimensions } from './../../hooks/responsiveHooks';
import { useHistory } from 'react-router';
import './SearchPage.css';

function SearchPage(props) {

    const { searchItem, searchData } = props;
    const history = useHistory();
    const auth = useAuth();
    const radioLoaders = useRadioLoaders();
    const DEFAULT_IMAGE_URL = 'https://images-na.ssl-images-amazon.com/images/I/51Ib3jYSStL._AC_SY450_.jpg';
    const resultsWrapperRef = useRef({});

    const handlePlaylistClick = (playlist) => {
        history.push('/playlist', {
            playlist: playlist,
        });
    };

    const handleUserClick = (user) => {
        history.push(`/profile/${user.id}`)
    }

    let element;
    if (searchData) {
        // console.log(searchData);
        const loaded = Object.keys(searchData).length !== 0;
        element = 
            <Fragment>
                <h2 className="search-page_results-header">Search results for: {searchItem}</h2>
                    <div className='search-results-wrapper' ref={resultsWrapperRef}>
                        <Results name="Songs"
                            getItems={() => searchData.tracks.items}
                            getImageCallback={
                                item => (item.album.images.length ? item.album.images[1].url : DEFAULT_IMAGE_URL)
                            }
                            getTitle={item => item.name}
                            getSubtitle={item => item.artists.map(artist => artist.name).join(', ')}
                            onItemClick={song => radioLoaders.loadSongRadio(song)}
                            loading={!loaded}
                            defaultText="No songs meet this search result!"
                            loggedIn={auth.id !== null}
                            wrapperRef={resultsWrapperRef}/>
                        <Results name="Artists"
                            getItems={() => searchData.artists.items}
                            getImageCallback={
                                item => (item.images.length ? item.images[1].url: DEFAULT_IMAGE_URL)
                            }
                            getTitle={item => item.name}
                            onItemClick={artist => {
                                radioLoaders.loadArtistRadio(artist)
                                console.log(artist)
                                }
                            }
                            loading={!loaded}
                            defaultText="No artists meet this search result!"
                            loggedIn={auth.id !== null}
                            wrapperRef={resultsWrapperRef}/>

                        <Results name="Albums"
                            getItems={() => searchData.albums.items}
                            getImageCallback={
                                item => (item.images.length ? item.images[1].url : DEFAULT_IMAGE_URL)
                            }
                            getTitle={item => item.name}
                            getSubtitle={item => item.artists.map(artist => artist.name).join(', ')}
                            onItemClick={album => radioLoaders.loadAlbumRadio(album)}
                            loading={!loaded}
                            defaultText="No albums meet this search result!"
                            loggedIn={auth.id !== null}
                            wrapperRef={resultsWrapperRef}/>
                        {auth.id && <Results name="Playlists"
                            getItems={() => searchData.playlists.items}
                            getImageCallback={item => item.image ? (`${process.env.REACT_APP_API_URL}/media/` + item.image): DEFAULT_IMAGE_URL}
                            getTitle={item => item.title}
                            getSubtitle={item => (item.username || ('User ' + item.owner_id))}
                            onItemClick={item => handlePlaylistClick(item)}
                            loading={!loaded}
                            defaultText="No playlists meet this search result!"
                            loggedIn={auth.id !== null}
                            wrapperRef={resultsWrapperRef}/> }
                        {auth.id && <Results name="Users"
                            getItems={() => searchData.users}
                            getTitle={item => item.username}
                            getSubtitle={() => ''}
                            onItemClick={handleUserClick}
                            loading={!loaded}
                            defaultText="No users meet this search result!"
                            loggedIn={auth.id !== null}
                            wrapperRef={resultsWrapperRef}/>
                        }
                    </div>
            </Fragment>
    } else {
        element = <h2 className="search-page_results-header">Search something up above!</h2>
    }

    return (
        <div id='search-page-wrapper' className='search-page-wrapper'>
            {element}
        </div>
    )

}

function Results(props) {
    const {name, getItems, getImageCallback, getTitle, getSubtitle, defaultText, 
            loading, onItemClick, loggedIn, wrapperRef } = props;
    const ORIGINAL_SHOW_VALUE = 4;
    const [ maxItemsShown, setMaxItemsShown] = useState(ORIGINAL_SHOW_VALUE);
    const items = !loading && getItems();
    const targetElement = useRef({});
    const [expanded, setExpanded] = useState(false);

    const handleShowMore = () => {      
        console.log(targetElement.current)
        let allResultDivs = document.getElementsByClassName('results-wrapper');
        let allWrapperDivs = document.getElementsByClassName('shrink-result-wrapper')

        for( let i = 0; i < allResultDivs.length ; i++){
            allResultDivs[i].classList.add("disabled");
        }
        targetElement.current.classList.remove("disabled");

        setTimeout( () => {
            for( let i = 0; i < allResultDivs.length ; i++){
                allWrapperDivs[i].classList.add("disabled");
            }
            targetElement.current.classList.add("enabled");
            targetElement.current.parentNode.classList.remove("disabled");
            targetElement.current.parentNode.classList.add("enabled");
            setExpanded(!expanded);
            setMaxItemsShown(100);
            window.location.hash = `search-page-wrapper`
        },1000)
        
        console.log(wrapperRef)
        console.log(window)
    }

    const handleShowLess = () => {

        let allResultDivs = document.getElementsByClassName('results-wrapper');
        let allWrapperDivs = document.getElementsByClassName('shrink-result-wrapper');
        for( let i = 0; i < allResultDivs.length ; i++){
            allResultDivs[i].classList.remove("disabled");
        }
        for( let i = 0; i < allResultDivs.length ; i++){
            allWrapperDivs[i].classList.remove("disabled");
        }
        targetElement.current.classList.remove("enabled");
        targetElement.current.parentNode.classList.remove("enabled");
        setExpanded(!expanded);
        setMaxItemsShown(ORIGINAL_SHOW_VALUE)  

        window.location.hash = `search-page-wrapper`; //Sets users view to where the box is

    }
    
    // if still loading, show loading icon. otherwise, show empty results.
    const body = (
        <Fragment>
            {!loading ? (
                <div className='results_items-wrapper'> 
                    {items.length ? (
                        items.slice(0, Math.min(items.length, maxItemsShown)).map((item) => (
                            <div className='result'>
                                <div className="result_image-wrapper" onClick={() => onItemClick(item)}>
                                    <span className="result_spacer"/>
                                    {name !== 'Users' ? (
                                        <img className="result_image"
                                    
                                        src={getImageCallback(item)}
                                        alt={getTitle(item)}/>
                                    ) : (
                                        
                                        item.image ? 
                                            (<img className="result_image"
                                              src={`${process.env.REACT_APP_API_URL}/media/` + item.image}
                                              alt={'User ' + item.username}
                                            />) : (
                                              <PersonIcon className={'profile_icon'} />
                                            )
                                        
                                    )}
                                </div>
                                <h3 className="result_title" onClick={() => onItemClick(item)}>
                                    {getTitle(item)}
                                </h3>
                                {getSubtitle && (
                                    <p className='result_subtitle'>{getSubtitle(item)}</p>
                                )}
                            </div>
                        ))
                    ) : (
                        <h3 className="results_default-text">
                            {defaultText}
                        </h3>
                    )}
                </div>
            ) : (
                <img className='loading-image' src={LoadingImage} alt="Loading"/>
            )}
            {items && (items.length > ORIGINAL_SHOW_VALUE) && 
                ( expanded ?
                (
                    <button className='result_show-more' onClick={() => handleShowLess()}>
                        Show less
                    </button>
                )
                :
                (
                    <button className='result_show-more' onClick={() => handleShowMore()}>
                        Show More
                    </button>
                )
                )
            }
        </Fragment>
    );

    const wrapperClassName = 'results-wrapper' + (loggedIn ? ' results_wrapper__user' : ' results_wrapper__guest');
    return (
        <div className='shrink-result-wrapper' id={name}>
            <div className={wrapperClassName} ref={targetElement}>
            <h2 className='results_title'>{name}</h2>
                {body}
            </div>
        </div>
    )
}

export default SearchPage;
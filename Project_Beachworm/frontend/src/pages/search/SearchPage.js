import { Fragment } from 'react';
import { useAuth } from './../../hooks/authHooks';
import LoadingImage from '../loading.svg';
import useRadioLoaders from '../../hooks/radioLoaders';

import './SearchPage.css';

function SearchPage(props) {
    const { searchItem, searchData } = props;
    const auth = useAuth();
    const radioLoaders = useRadioLoaders();
    const DEFAULT_IMAGE_URL = 'https://images-na.ssl-images-amazon.com/images/I/51Ib3jYSStL._AC_SY450_.jpg';

    const handlePlaylistClick = (playlist) => {
        console.log('Clicked playlist', playlist);
        // just load the playlist! history.push(/playlist)... and somehow pass in state
    };

    let element;
    if (searchData) {
        // console.log(searchData);
        const loaded = Object.keys(searchData).length !== 0;
        element = 
            <Fragment>
                <h2 className="search-page_results-header">Search results for: {searchItem}</h2>
                    <div className='search-results-wrapper'>
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
                            loggedIn={auth.id !== null}/>
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
                            loggedIn={auth.id !== null}/>
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
                            loggedIn={auth.id !== null}/>
                        {auth.id && <Results name="Playlists"
                            getItems={() => searchData.playlists.items}
                            getImageCallback={_item => DEFAULT_IMAGE_URL} // temporary
                            getTitle={item => item.title}
                            getSubtitle={item => (item.username || ('User ' + item.owner_id))}
                            onItemClick={item => handlePlaylistClick(item)}
                            loading={!loaded}
                            defaultText="No playlists meet this search result!"
                            loggedIn={auth.id !== null}/>}
                    </div>
            </Fragment>
    } else {
        element = <h2 className="search-page_results-header">Search something up above!</h2>
    }

    return (
        <div className='search-page-wrapper'>
            {element}
        </div>
    )

}

function Results(props) {
    const {name, getItems, getImageCallback, getTitle, getSubtitle, defaultText, loading, onItemClick, loggedIn } = props;
    const MAX_ITEMS_SHOWN = 4;
    const items = !loading && getItems();
    
    // if still loading, show loading icon. otherwise, show empty results.
    const body = (
        <Fragment>
            {!loading ? (
                <div className='results_items-wrapper'> 
                    {items.length ? (
                        items.slice(0, Math.min(items.length, MAX_ITEMS_SHOWN)).map((item) => (
                            <div className='result'>
                                <div className="result_image-wrapper" onClick={() => onItemClick(item)}>
                                    <img className="result_image"
                                        src={getImageCallback(item)}
                                        alt={getTitle(item)}/>
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
            {items && (items.length > MAX_ITEMS_SHOWN) && (
                <button className='result_show-more'>
                    Show More
                </button>
            )}
        </Fragment>
    );

    const wrapperClassName = 'results_wrapper' + (loggedIn ? ' results_wrapper__user' : ' results_wrapper__guest');
    return (
        <div className={wrapperClassName}>
        <h2 className='results_title'>{name}</h2>
            {body}
        </div>
    )
}

export default SearchPage;
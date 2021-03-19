import './SearchPage.css';

function SearchPage(props) {

    let { searchItem, searchData } = props;

    return (
        <div className='search-page-wrapper'>
            <h1> Search Results </h1>
            <h2> search for: {searchItem} </h2>
            {
                Object.keys(searchData).length === 0 
                ?
                    <h1>Loading</h1>
                :
                <div className='search-results-wrapper'>
                    <div className='line-one'>
                        <SongResults name='Songs' items={searchData.tracks.items}/>
                        <ArtistResults name='Artists'items={searchData.artists.items}/>
                    </div>
                    <div className='line-two'>
                        <AlbumResults name='Albums' items={searchData.albums.items}/>
                        <PlaylistResults name='Playlists' items={searchData.playlists.items}/>
                    </div>
                </div>
            }
        </div>
    )

}

function SongResults(props){

    let {name, items} = props;

    return (
        <div>
            <div className='results-group'>
                <div className='result-title'>
                    <h2>{name}</h2>
                    <p className='show-more'>Show More</p>
                </div>
                    <div className='results-results'> 
                        { 
                            items.slice(0,4).map((item) => {
                                let artistArray = item.artists.map((artist) => {
                                    return artist.name;
                                })
                                let artistString = artistArray.join(', ')
                                return(
                                    <div className='result'>
                                        <img src={item.album.images[1].url} />
                                        <h3>{item.name}</h3>
                                        <p className='artist-name'>{artistString}</p>
                                    </div>
                                )
                            })
                        }
                </div>
            </div>
        </div>
    )
}

function AlbumResults(props){

    let {name, items} = props;

    return (
        <div className='results-group'>
            <div className='result-title'>
            <h2>{name}</h2>
            <p className='show-more'>Show More</p>
                </div>
                <div className='results-results'> 
                { 
                    items.slice(0,4).map((item) => {
                        let artistArray = item.artists.map((artist) => {
                            return artist.name;
                        })
                        let artistString = artistArray.join(', ')
                        return(
                            <div className='result'>
                                <img src={item.images[1].url} />
                                <h3>{item.name}</h3>
                                <p className='artist-name'>{artistString}</p>
                            </div>
                        )
                    })
                }
            </div>
        </div>
    )
}

function ArtistResults(props){

    let {name, items} = props;

    return (
        <div className='results-group'>
            <div className='result-title'>
            <h2>{name}</h2>
            <p className='show-more'>Show More</p>
                </div>
                <div className='results-results'> 
                { 
                    items.slice(0,4).map((item) => {
                        return(
                            <div className='result'>
                                <img src={item.images[1].url} />
                                <h3>{item.name}</h3>
                            </div>
                        )
                    })
                }
            </div>
        </div>
    )
}

function PlaylistResults(props){

    let {name, items} = props;

    return (
        <div>
            <div className='results-group'>
                <div className='result-title'>
                    <h2>{name}</h2>
                    <p className='show-more'>Show More</p>
                </div>
                    <div className='results-results'> 
                        { 
                            items.slice(0,4).map((item) => {
                                return(
                                    <div className='result'>
                                        <img src={item.album.images[1].url} />
                                        <h3>{item.name}</h3>
                                    </div>
                                )
                            })
                        }
                </div>
            </div>
        </div>
    )
}

export default SearchPage;
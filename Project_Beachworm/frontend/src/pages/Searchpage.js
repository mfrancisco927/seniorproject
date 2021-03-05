import {useEffect} from 'react';

function Searchpage(props) {

    let { searchedItem } = props;

    return (
        <div className='search-page-wrapper'>
            <h1> Search Results </h1>
            <h3> search for: {searchedItem} </h3>
            <div className='search-results-wrapper'>
                <div className='line-two'>
                <div className='result'>
                <h2>song results</h2>
                        <div className='result-results'>
                            <ul>
                                <li>song</li>
                                <li>song</li>
                                <li>song</li>
                            </ul>
                        </div>
                </div>
                <div className='result'>
                <h2>artist results</h2>
                        <div className='result-results'>
                            <ul>
                                <li>artist</li>
                                <li>artist</li>
                                <li>artist</li>
                            </ul>
                        </div>
                </div>
                </div>
                <div className='line-one'>
                    <div className='result'>
                        <h2>playlist results</h2>
                        <div className='result-results'>
                            <ul>
                                <li>playlist</li>
                                <li>playlist</li>
                                <li>playlist</li>
                            </ul>
                        </div>
                    </div>
                    <div className='result'>
                    <h2>user results</h2>
                        <div className='result-results'>
                            <ul>
                                <li>user</li>
                                <li>user</li>
                                <li>user</li>
                            </ul>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )

}


export default Searchpage;
import './SearchPage.css';

function SearchPage(props) {

    let { searchItem, searchData } = props;

    return (
        <div className='search-page-wrapper'>
            <h1> Search Results </h1>
            <h3> search for: {searchItem} </h3>
            {
                Object.keys(searchData).length === 0 
                ?
                    <h1>Loading</h1>
                :
                    <h2>done!</h2>
            }
        </div>
    )

}

function searchResult(props){

    let {name, items} = props;

    
}


export default SearchPage;
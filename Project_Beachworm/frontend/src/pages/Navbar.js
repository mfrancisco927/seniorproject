import { Link } from 'react-router-dom';

function Navbar(props) {

  const { menuList, setSearchField, submitSearch } = props;
   
  return (

      <div className='nav-bar'>
        <ul className='nav-bar-items'>
          {           
            Object.entries(menuList).map( (menuPair , index) => {
                const href = menuPair[0];
                const pageName = menuPair[1];
                return(
                  <Link to={href} key={index}>{pageName}</Link>
                )
            })
          }
        </ul>
        <div className='nav-bar-search-bar'>
          <form onSubmit={submitSearch}>
            <input classname='nav-bar-search-input'type='text' id='search' name='search'  placeHolder='Search' onChange={ (e) => setSearchField(e.target.value) } />
            <button class='nav-bar-search-button' type='submit'> Search </button>
          </form>
        </div>
      </div>
    )

  }

export default Navbar;
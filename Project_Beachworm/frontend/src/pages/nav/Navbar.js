import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import './NavBar.css';


function Navbar(props) {

  const { menuList, setSearchField, submitSearch } = props;
  const [click, setClick] = useState(false);

  const handleClick = () => setClick(!click);
  const closeMobileMenu = () => setClick(false);
   
  return (
      <>
        <nav className='navbar'>
          <Link to='/landing' className='navbar-logo' onClick={closeMobileMenu}>
            BW
          </Link>
          <ul className={click ? 'nav-menu active' : 'nav-menu'}>
            {           
              Object.entries(menuList).map( (menuPair , index) => {
                  const href = menuPair[0];
                  const pageName = menuPair[1];
                  return(
                    <Link to={href} key={index} className = 'nav-links'>{pageName}</Link>
                  )
              })
            }
          </ul>
          <div className='nav-bar-search-bar'>
            <form onSubmit={submitSearch}>
              <input className='nav-bar-search-input' type='text' id='search' name='search'  placeholder='Search' onChange={ (e) => setSearchField(e.target.value) } />
              <button className='nav-bar-search-button' type='submit'> Search </button>
            </form>
          </div>
        </nav>
      </>
    )

  }

export default Navbar;
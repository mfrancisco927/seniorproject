import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import './NavBar.css';


function Navbar(props) {

  const { menuList, setSearchField, submitSearch } = props;
  const [click, setClick] = useState(false);
  const [dropdown, setDropdown] = useState(false);

  const handleClick = () => setClick(!click);
  const closeMobileMenu = () => setClick(false);

  const onMouseEnter = () => {
    if (window.innerWidth < 960) {
      setDropdown(false);
    } else {
      setDropdown(true);
    }
  };

  const onMouseLeave = () => {
    if (window.innerWidth < 960) {
      setDropdown(false);
    } else {
      setDropdown(false);
    }
  };
   
  return (
      <>
        <nav className='navbar'>
          <Link to='/landing' className='navbar-logo' onClick={closeMobileMenu}>
            BW
          </Link>
          <div className='menu-icon' onClick={handleClick}>
          <i className={click ? 'fas fa-times' : 'fas fa-bars'} />
          </div>
          <ul className={click ? 'nav-menu active' : 'nav-menu'}>
            <li className='nav-item'>
              <Link 
                to='/' 
                className='nav-links' 
                onClick={closeMobileMenu}
              >
                home
              </Link>
            </li>
            <li className='nav-item'>
              <Link 
                to='/explore'
                className='nav-links'
                onClick={closeMobileMenu}
              >
                explore
              </Link>
            </li>
            <li className='nav-item'>
              <Link
                to='/playlist'
                className='nav-links'
                onClick={closeMobileMenu}
              >
                playlist[temp]
              </Link>
            </li>
            <li className='nav-item'>
              <Link
                to='/landing'
                className='nav-links'
                onClick={closeMobileMenu}
              >
                landing[temp]
              </Link>
            </li>
            <li className='nav-item'>
              <Link
                to='/questionnaire'
                className='nav-links'
                onClick={closeMobileMenu}
              >
                questionnaire[temp]
              </Link>
            </li>
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
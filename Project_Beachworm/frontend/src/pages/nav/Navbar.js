import { useState, useEffect } from 'react';
import { NavLink } from 'react-router-dom';
import SearchIcon from '@material-ui/icons/Search';
import IconButton from '@material-ui/core/IconButton';
import './NavBar.css';

// window dimensions hook from https://stackoverflow.com/questions/36862334/get-viewport-window-height-in-reactjs
function getWindowDimensions() {
  const { innerWidth: width, innerHeight: height } = window;
  return {
    width,
    height
  };
}

function useWindowDimensions() {
  const [windowDimensions, setWindowDimensions] = useState(getWindowDimensions());

  useEffect(() => {
    function handleResize() {
      setWindowDimensions(getWindowDimensions());
    }

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  return windowDimensions;
}

function Navbar(props) {
  const { width } = useWindowDimensions();
  const { menuList, setSearchField, submitSearch, searchTermSelected } = props;
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const isMobile = width <= 960;

  const toggleMobileMenu = (event) => {
    if (isMobile) {
      event.preventDefault();
      setMobileMenuOpen(!mobileMenuOpen);
    }
  }
  const closeMobileMenu = () => setMobileMenuOpen(false);
   
  return (
      <nav className="navbar">
        <NavLink to="/landing" className="navbar-logo" onClick={toggleMobileMenu}>
          BW
        </NavLink>
        <ul className={mobileMenuOpen ? 'nav-menu active' : 'nav-menu'}>
          {           
            Object.entries(menuList).map((menuPair , index) => {
                const href = menuPair[0];
                const pageName = menuPair[1];
                return (
                  <NavLink
                  to={href}
                  key={index}
                  className={isMobile ? "nav-links mobile" : "nav-links"}
                  onClick={closeMobileMenu}>
                    {pageName}
                  </NavLink>
                )
            })
          }
        </ul>
        <div className="nav-bar-search-bar">
          <form className="nav-bar-search-form" onSubmit={submitSearch} >
            <input className="nav-bar-search-input"
            type="text"
            id="search"
            name="search"
            placeholder="Search"
            onChange={(e) => setSearchField(e.target.value)} />
            <IconButton className="nav-bar-search-button" type="submit" onClick={searchTermSelected}>
              <SearchIcon />
            </IconButton>
          </form>
        </div>
        {mobileMenuOpen && (
          <div className="click-wrapper"
          onClick={() => setMobileMenuOpen(false)}/>
        )}
      </nav>
    )

  }

export default Navbar;
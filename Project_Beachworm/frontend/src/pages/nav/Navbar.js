import { useState, useCallback } from 'react';
import { NavLink } from 'react-router-dom';
import SearchIcon from '@material-ui/icons/Search';
import IconButton from '@material-ui/core/IconButton';
import AccountBoxIcon from '@material-ui/icons/AccountBox';
import { useWindowDimensions, SCREEN_SIZE } from './../../hooks/responsiveHooks';
import { createBlockWrapper, bemKnownModifierApplier, bemConditionalModifier } from './../../util/bem-helpers';
import ProfileMenu from './../profile/ProfileMenu';
import './NavBar.scss';

function Navbar(props) {
  const { width } = useWindowDimensions();
  const { menuList, submitSearch, loggedIn } = props;
  const [searchText, setSearchText] = useState('');
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [profileMenuOpen, setProfileMenuOpen] = useState(false);
  const [profileMenuAnchor, setProfileMenuAnchor] = useState(null);
  const isMobile = width <= SCREEN_SIZE.SMALL;

  const block = createBlockWrapper('navbar');
  const mobileModifier = bemKnownModifierApplier('mobile', isMobile);
  const activeMobileModifier = bemConditionalModifier('active');

  const toggleMobileMenu = (event) => {
    if (isMobile) {
      event.preventDefault();
      setMobileMenuOpen(!mobileMenuOpen);
    }
  }

  const closeMobileMenu = () => setMobileMenuOpen(false);
  const closeProfileMenu = () => setProfileMenuOpen(false); 

  const handleProfileMenuClick = useCallback((event) => {
    setProfileMenuOpen(!profileMenuOpen);
    setProfileMenuAnchor(event.currentTarget);
  }, [profileMenuOpen]);

  const handleSubmit = (e) => {
    e.preventDefault();
    submitSearch(searchText);
  };

  return (
      <nav className={block('')}>
        <ProfileMenu
        anchorEl={profileMenuAnchor}
        open={profileMenuOpen} 
        onClose={closeProfileMenu}
        loggedIn={loggedIn} />
        <NavLink to="/landing" className={block('logo')} onClick={toggleMobileMenu}>
          BW
        </NavLink>
        <ul className={activeMobileModifier(mobileMenuOpen, block('menu'))}>
          {           
            Object.entries(menuList).map((menuPair, index) => {
                const href = menuPair[0];
                const pageName = menuPair[1];
                return (
                  <NavLink
                  to={href}
                  key={index}
                  className={mobileModifier(block('links'))}
                  onClick={closeMobileMenu}>
                    {pageName}
                  </NavLink>
                )
            })
          }
        </ul>
        <div className={block('additional-control-bar')}>
          <form className={block('search-form')} onSubmit={handleSubmit} >
            <input className={block('search-input')}
            type="text"
            id="search"
            name="search"
            placeholder="Search"
            onChange={(e) => setSearchText(e.target.value)} />
            <IconButton className={block('search-button')} type="submit">
              <SearchIcon />
            </IconButton>
            <IconButton
            className={block('profile-button')}
            onClick={handleProfileMenuClick}>
              <AccountBoxIcon />
            </IconButton>
          </form>
        </div>
        {mobileMenuOpen && (
          <div className={block('click-wrapper')}
          onClick={() => setMobileMenuOpen(false)}/>
        )}
      </nav>
    )

  }

export default Navbar;
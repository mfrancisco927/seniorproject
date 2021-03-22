import './App.css';
import { useState, Fragment, useRef } from 'react';
import { Switch, Route, useHistory, Redirect, useLocation } from "react-router-dom";
import MainPage from './pages/home/MainPage.js';
import Navbar from './pages/nav/Navbar.js';
import Explore from './pages/explore/Explore.js';
import ProfilePage from './pages/profile/ProfilePage.js';
import SearchPage from './pages/search/SearchPage.js';
import PlayFooter from './pages/playbackControllers/PlayFooter.js';
import PlaylistPage from './pages/playlist/PlaylistPage.js';
import Landing from './pages/landing/Landing.js';
import PageNotFound from './pages/pageNotFound/PageNotFound.js';
import Questionnaire1 from './pages/questionnaire/Questionnaire1.js';
import Questionnaire2 from './pages/questionnaire/Questionnaire2.js';
import SpotifyAuth from './pages/spotifyAuth/SpotifyAuth.js';
import {search} from './api/searchApi';

import { useAuth } from './hooks/authHooks';

// needed for Spotify SDK
window.onSpotifyWebPlaybackSDKReady = () => {};

function App() {
  const auth = useAuth();
  const history = useHistory();

  const [ searchField , setSearchField ] = useState('')
  const [ searchData, setSearchData] = useState({})

  const submitSearch = (e) => {
    e.preventDefault();
    setSearchData({});
    console.log(searchField)
    if(searchField !== ''){
      search(searchField).then( (data) => {
        setSearchData(data)
      }).then( () => {
        console.log(searchData)
      })
      history.push('/search');
    }
  }

  // which pages to carry over the footer to
  const footerPages = ['/landing', '/', '/profile', '/search'];
  const [showFooter, setShowFooter] = useState(false);

  // wrapper that dynamically sets the show footer status for each page
  const WithFooter = (props) => {
    const path = useLocation().pathname;
    setShowFooter(footerPages.includes(path) && !!auth.user);
    return (
      <Fragment>
        {props.children}
        { showFooter && (
          <AuthorizedOrHidden>
            <PlayFooter />
          </AuthorizedOrHidden>
        )}
      </Fragment>
    );
  };

  return (
    <div className={'page-wrapper' + (showFooter ? ' page-wrapper__footer' : ' page-wrapper__no-footer')}>
      {/* pages marked TEMP will not be accessible via nav-bar in production, but through some other context */}
      <Navbar menuList={{
        '/landing': 'Landing [TEMP]',
        '/': 'Home',
        '/questionnaire1': 'Questionnaire [TEMP]',
        '/explore': 'Explore',
        '/profile': 'Profile',
        '/playlist': 'Playlist [TEMP]',
        '/spotify-auth': 'Spotify Auth [TEMP]',
      }} searchField={searchField} setSearchField={setSearchField} submitSearch={submitSearch}
      />
      <WithFooter>
        <AuthorizedOrHidden>
          <button onClick={() => auth.signOut()}>Log out</button>
        </AuthorizedOrHidden>
        <Switch>
          <Route path='/landing'>
            <Landing />
          </Route>
          <Route path='/explore'>
            <RequireSpotifyAuthForLoggedInOnly>
              <Explore />
            </RequireSpotifyAuthForLoggedInOnly>
          </Route>
          <PrivateRoute path='/questionnaire1'>
            <Questionnaire1 />
          </PrivateRoute>
          <PrivateRoute path='/questionnaire2'>
            <Questionnaire2 />
          </PrivateRoute>
          <PrivateRoute path='/profile'>
            <ProfilePage />
          </PrivateRoute>
          <PrivateRoute path='/playlist'>
            <PlaylistPage />
          </PrivateRoute>
          <PrivateRoute path='/search'>
            <SearchPage searchItem={searchField} searchData={searchData} />
          </PrivateRoute>
          <PrivateRoute path='/spotify-auth'>
            <SpotifyAuth />
          </PrivateRoute>
          <Route path='/' exact>
            <RequireSpotifyAuthForLoggedInOnly>
              <MainPage />
            </RequireSpotifyAuthForLoggedInOnly>
          </Route>
          <Route path='*'>
            <PageNotFound />
          </Route>
        </Switch>
      </WithFooter>
    </div>
  );
}

// adapted from https://reactrouter.com/web/example/auth-workflow
// acts as a typical route, but if a user is not signed in, it first redirects
// them to the landing page to sign in. the landing page can use the redirect
// information passed into history.location.state to redirect the user back
function PrivateRoute({ children, ...rest }) {
  const auth = useAuth();
  return (
    <Route
      {...rest}
      render={({ location }) =>
        auth.user ? (
          children
        ) : (
          <Redirect
            to={{
              pathname: "/landing",
              state: { redirect: location }
            }}
          />
        )
      }
    />
  );
}

/* wrapper component to require spotify authentication for a page,
 * redirects to spotify auth if not authenticated (which will redirect
 * back on successful authentication) */
function RequireSpotifyAuth({ children }) {
  const authRef = useRef(useAuth());
  const locRef = useRef(useLocation());
  const auth = authRef.current;
  const location = locRef.current;

  return (
    auth.hasAuthenticatedSpotify ? (
      children
    ) : (
      <Redirect to={{
        pathname: '/spotify-auth',
        state: { redirect: location.pathname }
      }} />
    )
  )
}

/* wrapper component that only requires a logged in user to be Spotify authenticated,
* but signed out users (i.e. guests) can see the page. useful for when we have different
* behaviors but same link for a route based on sign-in status, e.g. the explore page */
function RequireSpotifyAuthForLoggedInOnly({ children }) {
  const auth = useAuth();
  return auth.id ? (
    <RequireSpotifyAuth>
      {children}
    </RequireSpotifyAuth>
  ) : (
    children
  );
}

// if the user is signed in, display the children. if not, display nothing at all.
function AuthorizedOrHidden({ children }) {
  const auth = useAuth();
  return auth.user ? children : null;
}

export default App;

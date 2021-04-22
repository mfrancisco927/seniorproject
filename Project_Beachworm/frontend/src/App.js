import './App.css';
import { useState, Fragment } from 'react';
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
import { search } from './api/searchApi';
import { useAuth } from './hooks/authHooks';

// needed for Spotify SDK
window.onSpotifyWebPlaybackSDKReady = () => {};

function App() {
  const auth = useAuth();
  const history = useHistory();

  const [ searchText, setSearchText ] = useState(null);
  const [ searchData, setSearchData ] = useState(null);

  const submitSearch = (text) => {
    if (text) {
      setSearchText(text);
      setSearchData({});
      search(text).then(data => {
        setSearchData(data);
      });
      history.push('/search');
    }
  };

  // which pages to carry over the footer, regex matched
  const footerPages = ['^/$',
  '^/landing([/\\?#].*)?$',
  '^/profile([/\\?#].*)?$',
  '^/search([/\\?#].*)?$',
  '^/playlist([/\\?#].*)?$'];
  const [showFooter, setShowFooter] = useState(false);

  // wrapper that dynamically sets the show footer status for each page
  const WithFooter = (props) => {
    const path = useLocation().pathname;
    setShowFooter(footerPages.some(page => path.match(page)) && auth.id !== null);
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

  const navList = (auth.id !== null) ? ({
    '/': 'Home',
    '/explore': 'Explore',
    '/profile': 'Profile',
  }) : ({
    '/home': 'Home',
    '/explore': 'Explore',
    '/landing': 'Sign in',
  });

  const WrappedHome = () => (
    <RequireSpotifyAuthForLoggedInOnly>
      <RequireSeedsChosen>
        <MainPage />
      </RequireSeedsChosen>
    </RequireSpotifyAuthForLoggedInOnly>
  );

  return (
    <div className={'page-wrapper' + (showFooter ? ' page-wrapper__footer' : ' page-wrapper__no-footer')}>
      {/* pages marked TEMP will not be accessible via nav-bar in production, but through some other context */}
      <Navbar
      submitSearch={submitSearch}
      menuList={navList}
      loggedIn={auth.id !== null} />
      <WithFooter>
        <Switch>
          <Route path='/landing'>
            <Landing />
          </Route>
          <Route path='/explore'>
            <RequireSpotifyAuthForLoggedInOnly>
              <RequireSeedsChosen>
                <Explore />
              </RequireSeedsChosen>
            </RequireSpotifyAuthForLoggedInOnly>
          </Route>
          <PrivateRoute path='/questionnaire1'>
            <Questionnaire1 />
          </PrivateRoute>
          <PrivateRoute path='/questionnaire2'>
            <Questionnaire2 />
          </PrivateRoute>
          <PrivateRoute path={['/profile/:profileId', '/profile']}>
            <ProfilePage />
          </PrivateRoute>
          <PrivateRoute path='/playlist'>
            <RequireSpotifyAuth>
              <PlaylistPage />
            </RequireSpotifyAuth>
          </PrivateRoute>
          <Route path='/search'>
            <SearchPage searchItem={searchText} searchData={searchData} />
          </Route>
          <PrivateRoute path='/spotify-auth'>
            <SpotifyAuth />
          </PrivateRoute>
          <Route path='/' exact>
            {(auth.id !== null) ? (
              <WrappedHome />
            ) : (
              <Landing />
            )}
          </Route>
          <Route path='/home'>
            <WrappedHome />
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
  const unlikelyUser = auth.id === null && !auth.tokens.refresh;

  if (unlikelyUser) {
    console.log('User tried to access private route. Redirecting to landing.');
  }

  return (
    <Route
      {...rest}
      render={({ location }) =>
        !unlikelyUser ? (
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

/* wrapper component to require questionnaire to be done for a page,
 * redirects to questionnaire if not completed (which will redirect
 * back on successful completion) */
function RequireSeedsChosen({ children }) {
  const auth = useAuth();
  const location = useLocation();

  const { genre: hasGenreSeeds, artist: hasArtistSeeds } = auth.hasSeeds;

  // if we're not logged in, just return children right away
  return (
    (auth.id === null || !auth.isFullyLoaded || (hasGenreSeeds && hasArtistSeeds)) ? (
      children
    ) : (
      <Redirect to={{
        pathname: hasGenreSeeds ? '/questionnaire2' : '/questionnaire1',
        state: { redirect: location.pathname }
      }} />
    )
  )
}

/* wrapper component to require spotify authentication for a page,
 * redirects to spotify auth if not authenticated (which will redirect
 * back on successful authentication) */
function RequireSpotifyAuth({ children }) {
  const auth = useAuth();
  const location = useLocation();

  return (
    (auth.hasAuthenticatedSpotify || !auth.isFullyLoaded) ? (
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
  return auth.id !== null ? children : null;
}

export default App;

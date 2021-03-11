import './App.css';
import React, { useState } from 'react';
import { Switch, Route, useHistory, Redirect } from "react-router-dom";
import MainPage from './pages/home/MainPage.js';
import Navbar from './pages/nav/Navbar.js';
import Explore from './pages/explore/Explore.js';
import ProfilePage from './pages/profile/ProfilePage.js';
import SearchPage from './pages/search/SearchPage.js';
import PlayFooter from './pages/playingToolbar/PlayFooter.js';
import PlaylistPage from './pages/playlist/PlaylistPage.js';
import Landing from './pages/landing/Landing.js';
import PageNotFound from './pages/pageNotFound/PageNotFound.js';
import UserQuestionnaire from './pages/questionnaire/UserQuestionnaire.js';

import { useAuth } from './hooks/authHooks';

function App() {
  const auth = useAuth();
  const history = useHistory();

  const testingItems = [
    {
      'img':'https://upload.wikimedia.org/wikipedia/en/c/c4/Floral_Green.jpg',
      'name': '[TEST] Floral Green'
    },
    {
      'img':'https://media.pitchfork.com/photos/5a71df0d85ed77242d8f1252/1:1/w_320/jpegmafiaveteran.jpg',
      'name': '[TEST] Veteran'
    },
    {
      'img':'https://i.pinimg.com/originals/78/6e/a3/786ea3d49748ab17966e4301f0f73bb6.jpg',
      'name': '[TEST] Don\'t Smile At Me'
    }
  ];

  const [ searchField , setSearchField ] = useState('')

  const submitSearch = (e) => {
    e.preventDefault();
    console.log(searchField);
    history.push('/search');
  }

  const changeSong = (song) => {
    history.push('/playlist');
    console.log('Changing song to ' + song);
  }

  return (
    <div className='outer-wrapper'>
      <div className='page-wrapper'>
        {/* pages marked TEMP will not be accessible via nav-bar in production, but through some other context */}
        <Navbar menuList={{
          '/landing': 'Landing [TEMP]',
          '/': 'Home',
          '/questionnaire': 'Questionnaire [TEMP]',
          '/explore': 'Explore',
          '/profile': 'Profile',
          '/playlist': 'Playlist [TEMP]',
        }} searchField={searchField} setSearchField={setSearchField} submitSearch={submitSearch}
        />
        <AuthorizedOrHidden>
          <button onClick={(event) => auth.signOut()}>Log out</button>
        </AuthorizedOrHidden>
        <Switch>
          <Route path='/landing'>
            <Landing />
          </Route>
          <Route path='/explore'>
            <Explore songList={testingItems} />
          </Route>
          <PrivateRoute path='/questionnaire'>
            <UserQuestionnaire />
          </PrivateRoute>
          <PrivateRoute path='/profile'>
            <ProfilePage />
          </PrivateRoute>
          <PrivateRoute path='/playlist'>
            <PlaylistPage />
          </PrivateRoute>
          <PrivateRoute path='/search'>
            <SearchPage searchedItem={searchField} />
          </PrivateRoute>
          <Route path='/' exact>
            <MainPage changeSong={changeSong} />
          </Route>
          <Route path='*'>
            <PageNotFound />
          </Route>
        </Switch>
      </div>
      <AuthorizedOrHidden>
        <PlayFooter />
      </AuthorizedOrHidden>
    </div>
  );
}


// adapted from https://reactrouter.com/web/example/auth-workflow
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

function AuthorizedOrHidden({ children }) {
  const auth = useAuth();
  return auth.user ? children : null;
}

export default App;

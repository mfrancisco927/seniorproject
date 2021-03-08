import './App.css';
import React, { useState } from 'react';
import { Switch, Route, useHistory } from "react-router-dom";
import MainPage from './pages/home/MainPage.js';
import Navbar from './pages/nav/Navbar.js';
import Explore from './pages/explore/Explore.js'
import ProfilePage from './pages/profile/ProfilePage.js'
import SearchPage from './pages/search/SearchPage.js'
import PlayFooter from './pages/playingToolbar/PlayFooter.js'
import PlaylistPage from './pages/playlist/PlaylistPage.js'
import Landing from './pages/landing/Landing.js'

function App() {
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
        <Navbar menuList={{
          '/Landing': 'Landing',
          '/': 'Home',
          '/explore': 'Explore',
          '/profile': 'Profile',
          '/playlist': 'Playlist (this link won\'t be accessible here in prod)',
        }} searchField={searchField} setSearchField={setSearchField} submitSearch={submitSearch}
        />

        <Switch>
          <Route path='/landing'>
            <Landing />
          </Route>
          <Route path='/explore'>
            <Explore songList={testingItems} />
          </Route>
          <Route path='/profile'>
            <ProfilePage />
          </Route>
          <Route path='/playlist'>
            <PlaylistPage />
          </Route>
          <Route path='/search'>
            <SearchPage searchedItem={searchField} />
          </Route>
          <Route path='/' exact>
            <MainPage changeSong={changeSong} />
          </Route>
          <Route path='*'>
            404
          </Route>
        </Switch>
      </div>
      <PlayFooter />
    </div>
  );

}

export default App;

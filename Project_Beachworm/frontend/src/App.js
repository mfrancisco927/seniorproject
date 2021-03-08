import './App.css';
import React, { useState } from 'react';
import { Switch, Route, useHistory } from "react-router-dom";
import Mainpage from './pages/Mainpage.js';
import Navbar from './pages/Navbar.js';
import CurrPlaying from './pages/CurrPlaying.js'
import Profilepage from './pages/Profilepage.js'
import Searchpage from './pages/Searchpage.js'
import PlayFooter from './pages/PlayFooter.js'

function App() {
  const history = useHistory();

  const testingItems = [
    {
      'img':'https://upload.wikimedia.org/wikipedia/en/c/c4/Floral_Green.jpg',
      'name': 'Floral Green'
    },
    {
      'img':'https://media.pitchfork.com/photos/5a71df0d85ed77242d8f1252/1:1/w_320/jpegmafiaveteran.jpg',
      'name': 'Veteran'
    },
    {
      'img':'https://i.pinimg.com/originals/78/6e/a3/786ea3d49748ab17966e4301f0f73bb6.jpg',
      'name': 'Veteran 2'
    }
  ];

  const [ searchField , setSearchField ] = useState('')

  const submitSearch = (e) => {
    e.preventDefault();
    console.log(searchField);
    history.push('/search');
  }

  const changeSong = (song) => {
    history.push('/playing');
    console.log('Changing song to ' + song);
  }

  return (

    <div className='page-wrapper'>
      <Navbar menuList={{
        '/': 'Home',
        '/playing': 'Playing',
        '/profile': 'Profile',
      }} searchField={searchField} setSearchField={setSearchField} submitSearch={submitSearch}
      />

      <Switch>
        <Route path='/playing'>
          <CurrPlaying songList={testingItems} />
        </Route>
        <Route path='/profile'>
          <Profilepage />
        </Route>
        <Route path='/search'>
          <Searchpage searchedItem={searchField} />
        </Route>
        <Route path='/' exact>
          <Mainpage changeSong={changeSong} />
        </Route>
        <Route path='*'>
          404
        </Route>
      </Switch>

      <PlayFooter />
    </div>
  )

}

export default App;

import './App.css';
import React, { useState } from 'react';
import Mainpage from './pages/Mainpage.js';
import Navbar from './pages/Navbar.js';
import CurrPlaying from './pages/CurrPlaying.js'
import Profilepage from './pages/Profilepage.js'
import Searchpage from './pages/Searchpage.js'
import PlayFooter from './pages/PlayFooter.js'

function App() {

  const [testingItems, setTestingItems] = useState([
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
  ])

  const [ screenIndex, setScreenIndex ] = useState(0)
  const [ searchField , setSearchField ] = useState('')

  const submitSearch = (e) => {
    e.preventDefault();
    console.log(searchField);
    setScreenIndex(3); 
    console.log(screenIndex)
  }

  const changeSong = (song) => {
    setTestingItems( [song, ...testingItems] );
    setScreenIndex(1);
    console.log(testingItems)
  }

  return (

    <div className='page-wrapper'>
      <Navbar menuList={['Home','Explore','Profile']} changeScreen={setScreenIndex} searchField={searchField} setSearchField={setSearchField} submitSearch={submitSearch}/>

      { screenIndex === 0 ? 
        <Mainpage changeSong={changeSong} /> : 
        screenIndex === 1 ? 
        <CurrPlaying songList={testingItems}/> : 
        screenIndex === 2 ? 
        <Profilepage /> : 
        screenIndex === 3 ? 
        <Searchpage searchedItem={searchField}/>:
        'an error' }

        {screenIndex !== 1 && <PlayFooter />}
        
    </div>
  )

}

export default App;

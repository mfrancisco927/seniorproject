import React , { Component, useState, useEffect, useHistory } from 'react';
import './MainPage.css';
import ArrowBackIosIcon from '@material-ui/icons/ArrowBackIos';
import ArrowForwardIosIcon from '@material-ui/icons/ArrowForwardIos';
import { useAuth } from './../../hooks/authHooks';
import { useSpotifySdk } from './../../hooks/spotifyHooks';

const testingItems = [
  {
  'img':'https://upload.wikimedia.org/wikipedia/en/c/c4/Floral_Green.jpg',
  'name': 'TEST 1! RUN SERVER FOR LIVE DATA',
  song_id: '7BJny7nQN5bY4EeGVU3kj6',
  },
  {
    'img':'https://media.pitchfork.com/photos/5a71df0d85ed77242d8f1252/1:1/w_320/jpegmafiaveteran.jpg',
    'name': 'TEST 2! RUN SERVER FOR LIVE DATA',
    song_id: '03n2zDv0TXbH2q9XpzYpqY',
  },
  {
    'img':'https://i.pinimg.com/originals/78/6e/a3/786ea3d49748ab17966e4301f0f73bb6.jpg',
    'name': 'TEST 3! RUN SERVER FOR LIVE DATA',
    song_id: '5imSIRUGtX4aeRRA81UakE',
  },    
  {
    'img':'https://i.pinimg.com/originals/78/6e/a3/786ea3d49748ab17966e4301f0f73bb6.jpg',
    'name': 'TEST 3! RUN SERVER FOR LIVE DATA',
    song_id: '3VXtkBYkeDqVTECO1OOdXd',
  },    
  {
    'img':'https://i.pinimg.com/originals/78/6e/a3/786ea3d49748ab17966e4301f0f73bb6.jpg',
    'name': 'TEST 3! RUN SERVER FOR LIVE DATA',
    song_id: '3VXtkBYkeDqVTECO1OOdXd',
  }
];

function MainPage(props) {

  const spotify = useSpotifySdk();

  const {changeSong} = props;
  const [data, setData] = useState(testingItems);

  const fetchSongs = async () => {
    console.log('fetching...')

        try {
          let url = 'http://127.0.0.1:8000/api/get-songs/'
          const response = await fetch(url);
          const tempdata = await response.json();

          console.log('New song data received', tempdata)
          // setData(tempdata)
    
        } catch(error) {
          console.log(error)
        }
    }

    useEffect( () =>{
      fetchSongs();
    }, [])

  return (
    <div>
      <SongRow spotify={spotify} title='Recommended Albums' items={data} />
      <SongRow spotify={spotify} title='Recommended Genres' items={data} />
      <SongRow spotify={spotify} title='Playlists by your Followed' items={data} />
    </div>
  );
}

class SongRow extends Component {

  constructor(props){
    super(props);
    this.state = {
      title: props.title,
      hasOverflow: false,
      items: props.items,
      spotify: props.spotify,
    }
    this.moveRow = this.moveRow.bind(this);
    this.songBoxRef = React.createRef();
    this.changeSong = this.changeSong.bind(this);
  }

  componentDidMount(){
  }

  moveRow(direction){
    if(direction === 'left'){
      this.songBoxRef.current.scrollLeft -= 200;
    }else if(direction === 'right'){        
      this.songBoxRef.current.scrollLeft += 200;
    }
  }

  changeSong(items){
    
    let songsMapped = items.map((item) => ( {id: item.song_id, name: item.name} ))
    console.log(songsMapped)
    this.state.spotify.clearContextPlayQueue();
    this.state.spotify.play(songsMapped[0].id);
    this.state.spotify.setContextPlayQueue(
            {   
                name: 'Explore_Blank',
                songs: songsMapped.slice(1)  
            })
    //TODO: pass in callback function here ^^^ for getMoreSongs
    //TODO: get useHistory to work, need to change back to functional
  }

  render() {
    return (
      <div className='group-wrapper' >
          <div className='group-header'><h2>{this.state.title}</h2></div>
              <div className='songs-buttons-wrapper'>
                  <ArrowBackIosIcon fontSize='large' className='pan pan-left' onClick={() => this.moveRow('left')} />
                <div className='songs-wrapper' ref={this.songBoxRef}>
                { 
                  this.state.items.map((item) => {
                    return (
                      <div className='song-wrapper'>
                          <img src={item.img} alt='hello!' onClick={ () => this.changeSong(testingItems)} /> 
                          <h3> {item.name } </h3>
                      </div>
                    );
                  })
                }
                </div>
                <ArrowForwardIosIcon fontSize='large' className='pan pan-right' onClick={() => this.moveRow('right')}/>

              
            </div>
        </div>
    );
  }

}

export default MainPage;

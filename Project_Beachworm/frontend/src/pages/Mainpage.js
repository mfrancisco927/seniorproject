import React , { useState, useEffect } from 'react';


function Mainpage(props) {
  const testingItems = [
    {
    'img':'https://upload.wikimedia.org/wikipedia/en/c/c4/Floral_Green.jpg',
    'name': 'TEST 1! RUN SERVER FOR LIVE DATA'
    },
    {
      'img':'https://media.pitchfork.com/photos/5a71df0d85ed77242d8f1252/1:1/w_320/jpegmafiaveteran.jpg',
      'name': 'TEST 2! RUN SERVER FOR LIVE DATA'
    },
    {
      'img':'https://i.pinimg.com/originals/78/6e/a3/786ea3d49748ab17966e4301f0f73bb6.jpg',
      'name': 'TEST 3! RUN SERVER FOR LIVE DATA'
    }
  ];

  const {changeSong} = props;
  const [data, setData] = useState(testingItems);

  const fetchSongs = async () => {
    console.log('fetching...')

        try {
          let url = 'http://127.0.0.1:8000/get-songs/'
          const response = await fetch(url);
          const tempdata = await response.json();

          console.log('New song data received', tempdata)
          setData(tempdata)
    
        }catch(error){
          console.log(error)
        }
    }

    useEffect( () =>{
      fetchSongs();
    }, [])

  return (
    <div>
      <SongRow changeSong={changeSong} title='Recommended Songs' items={data} />
      <SongRow changeSong={changeSong} title='Recommended Albums' items={data} />
      <SongRow changeSong={changeSong} title='Playlists by your Followed' items={data} />
    </div>
  );
}

function SongRow(props) {
  const {title, items, changeSong} = props;

  return (
    <div className='group-wrapper'>
        <div className='group-header'><h2>{title}</h2></div>
        { 
          items.map((item) => {
            return (
              <div className='song-wrapper'>
                  <img src={item.img} alt='hello!' onClick={ () => changeSong(item) } /> 
                  <h3> {item.name } </h3>
              </div>
            );
          })
        }
    </div>
  )

}

export default Mainpage;

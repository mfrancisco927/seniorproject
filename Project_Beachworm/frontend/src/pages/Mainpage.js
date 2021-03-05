import React , { useState, useEffect } from 'react';


function Mainpage(props) {

  const {changeSong} = props;
  const [data, setData] = useState({})

  const fetchSongs = async () => {
    console.log('fetching...')

        try {
          let url = 'http://127.0.0.1:8000/get-songs/'
          const response = await fetch(url);
          const tempdata = await response.json();

          setData(tempdata)
          console.log(tempdata)
    
        }catch(error){
          console.log(error)
        }
    }

    useEffect( () =>{
      fetchSongs();
    }, [])
  

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
    ]

  return (
    <>
    <SongRow changeSong={changeSong} title='Recommended Songs' items={testingItems} />
    <SongRow changeSong={changeSong} title='Recommended Albums' items={testingItems} />
    <SongRow changeSong={changeSong} title='Playlists by your Followed' items={testingItems} />
    </>
  );
}

function SongRow(props) {

  const {title, items, changeSong} = props;

  return (
    <div className='group-wrapper'>
        <div className='group-header'><h2>{title}</h2></div>

        { items.map( (item) => {
          return(
            <>    
              <div className='song-wrapper'>
                  <img src={item.img} alt='hello!' onClick={ () => changeSong(item) } /> 
                  <h3> {item.name } </h3>
              </div>
            </>
          )
        } ) }
        
    </div>
  )

}

export default Mainpage;

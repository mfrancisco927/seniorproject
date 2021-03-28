import { useEffect, useState } from 'react';
import Grid from '@material-ui/core/Grid';
import { useAuth } from './../../hooks/authHooks';
import { obtainArtists } from '../../api/recommendationApi';
import { postArtistSeeds } from '../../api/recommendationApi';
import { useHistory } from 'react-router-dom';
import DefaultImage from './../images/genres/placeholder.png';
import LoadingImage from './../loading.svg';
import './Questionnaire.css';

function Questionnaire2() {
  const history = useHistory();
  const auth = useAuth();
  const { redirect } = history.location.state || {};
  const [artists, setArtists] = useState(null);

  useEffect(() => {
    const getArtists = async () => {
      await obtainArtists().then(data => {
        const artists = data.artists.items;
        artists.forEach(artistsKV =>
          artistsKV.selected = false
        )
        setArtists(artists);
        console.log('Acquired artist data: ', artists);
      })
    };

    getArtists();
  }, []);

  const onIconClick = (event) => {
    let newState = [...artists];
    newState[event.target.id].selected = !newState[event.target.id].selected;
    setArtists(newState);
  }

  const sendArtistSeeds = () => {
    let artistIds = [];
    artists.forEach(artistKV => {
      if (artistKV.selected) {
        artistIds.push(artistKV.id);
      }
    });
    console.log('Sending artist seeds', artistIds);
    postArtistSeeds(artistIds).then(() => {
      auth.setHasSeeds({
        ...auth.hasSeeds,
        artist: true,
      });
      history.push(redirect || '/explore');
    });
  }

  return (
    <div className="questionnaire">
        <button 
          type="button" 
          className="btn"
          onClick={sendArtistSeeds}
        >
          Submit
        </button>
        <Grid container>
          {artists ? (
            artists.map((icon, index) => (
            <Grid item sm key={index}>
              <div className={icon.selected ? "withBorder" : "noBorder"} >
                <img
                  src={icon.images.length ? icon.images[1].url : DefaultImage}
                  width="300"
                  height="300"
                  id={index}
                  alt={icon.name}
                  onClick={(e) => onIconClick(e)} />
                <p>{icon.name}</p>
              </div>
            </Grid>
          ))
        ) : (
          <img className="loading-image" src={LoadingImage} alt="Artists loading..." />
        )}
        </Grid>     
    </div>
  );
}

export default Questionnaire2;
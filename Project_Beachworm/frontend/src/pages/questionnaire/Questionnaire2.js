import { useEffect, useState } from 'react';
import Grid from '@material-ui/core/Grid';
import { useAuth } from './../../hooks/authHooks';
import { obtainArtists } from '../../api/recommendationApi';
import { postArtistSeeds } from '../../api/recommendationApi';
import { useHistory } from 'react-router-dom';
import DefaultImage from './../images/genres/placeholder.png';
import LoadingImage from './../loading.svg';
import { useWindowDimensions, SCREEN_SIZE } from './../../hooks/responsiveHooks';
import { Typography, AppBar, Button, Container } from '@material-ui/core';
import Fab from '@material-ui/core/Grid';
import './Questionnaire.css';
import { makeStyles } from '@material-ui/core/styles';

const useStyles = makeStyles({
  AppBar: {
    background: 'transparent', 
    boxShadow: 'none'
  },

  ArtistFabBig: {
    fontSize: '1.4em',
    textTransform: 'capitalize',
  },

  ArtistFabSmall: {
    fontSize: '1.2em',
    textTransform: 'capitalize',
  },

  SubmitButton: {
    float: 'right',
  },
})


function Questionnaire2() {
  const history = useHistory();
  const auth = useAuth();
  const { redirect } = history.location.state || {};
  const [artists, setArtists] = useState(null);
  const { width } = useWindowDimensions();
  const classes = useStyles()
  const isMobile = width <= SCREEN_SIZE.SMALL;

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

  return !isMobile ? (
    <div className="questionnaire">
      <AppBar className={classes.AppBar} position='sticky' fullWidth='false'>
        <Container maxWidth='xl'>    
            <Button 
              className={classes.SubmitButton}
              variant="contained"
              type="button" 
              width='20%'
              onClick={sendArtistSeeds}
            >
          Submit
          </Button>
        </Container>
      </AppBar>
      <Typography align='center' color='primary' variant='h4'>Select some artists you like</Typography>
      <Grid container>
        {artists ? (
          artists.map((icon, index) => (
          <Grid item sm key={index}>
            <div className={icon.selected ? "withBorder" : "noBorder"} >
              <img
                src={icon.images.length ? icon.images[1].url : DefaultImage}
                width="300"
                
                id={index}
                alt={icon.name}
                onClick={(e) => onIconClick(e)} />
            <Fab
                  className={classes.ArtistFabBig}
                  variant="extended"
                  id={index}
                  alt={icon.name}
                  onClick={(e) => onIconClick(e)}>
                  {icon.name}
            </Fab>
            </div>
          </Grid>
          ))
        ) : (
          <img className="loading-image" src={LoadingImage} alt="Artists loading..." />
        )}
        </Grid>     
    </div>
  ) : (
    <div className="questionnaire">
      <AppBar className={classes.AppBar} position='sticky' fullWidth='false'>
        <Container maxWidth='xl' >    
            <Button
              className={classes.SubmitButton} 
              variant="contained"
              type="button" 
              width='20%'
              onClick={sendArtistSeeds}
            >
          Submit
          </Button>
        </Container>
      </AppBar>
      <Typography align='center' color='primary' variant='h5'>Select some artists you like</Typography>
      <Grid container justify="space-evenly" alignItems="flex-start" spacing={0}>
        {artists ? (
          artists.map((icon, index) => (
          <Grid item key={index} sm={4} xs={4}>
            <div className={icon.selected ? "withBorder" : "noBorder"} >
              <img
               
                src={icon.images.length ? icon.images[1].url : DefaultImage}
                width="98%"
                float='center'
                id={index}
                alt={icon.name}
                onClick={(e) => onIconClick(e)} />
             
              <Fab
                    className={classes.ArtistFabSmall}
                    variant="extended"
                    id={index}
                    alt={icon.name}
                    onClick={(e) => onIconClick(e)}>
                    {icon.name}
              </Fab>
            </div>
          </Grid>
        ))
      ) : (
        <img className="loading-image" src={LoadingImage} alt="Artists loading..." />
      )}
      </Grid>     
    </div>
  ) ;
}

export default Questionnaire2;
import React , { Component } from 'react';
import { Link } from 'react-router-dom';
import Grid from '@material-ui/core/Grid';
import { obtainArtists } from '../../api/recommendationApi';
import { postArtistSeeds } from '../../api/recommendationApi';
import './Questionnaire.css';

class Questionarre2 extends Component {
  constructor(props) {
    super(props)
    this.state = {artists: {
      artists:{
        href: '',
        items: [{
          external_urls: {spotify: '0'},
          followers:{href: '0', total: 0},
          genres: ["0"],
          href: '0',
          id: '0',
          images: [{
            height: 640,
            url: "../images/genres/placeholder.png",
            width: 640
          },
          {
            height: 320,
            url: "../images/genres/placeholder.png",
            width: 320,
          },
          {
            height: 160,
            url: "../images/genres/placeholder.png",
            width: 160,
          }],
          name: '0',
          popularity: 0,
          selected: false,
          type: "artist",
          uri: '0',
        }],
        limit: 20,
        next: '0',
        offset: '0',
        previous: null,
        total: 10000
      }
    }}
  }
  async getArtists(){
    await obtainArtists().then(data => {
      data.artists.items.forEach(artistsKV =>
        artistsKV.selected = false
      )
      this.setState({
        artists: data
      })
      console.log(data)
    })
  }
  async componentDidMount(){
    await this.getArtists();
    console.log(this.state);
  }
  onIconClick(event) {
    let newState = this.state;
    console.log(event.target.id)
    console.log(newState.artists.artists.items[event.target.id])
    newState.artists.artists.items[event.target.id].selected = !newState.artists.artists.items[event.target.id].selected;
    this.setState({
      newState,
    })
  }

  sendArtistSeeds(){
    let genreIds = [];
    Object.entries(this.state.genres).forEach(genreKV => {
      if(genreKV[1].selected){
        genreIds.push(genreKV[1].spotifyid);
      }
    });
    console.log(genreIds);
    postGenreSeeds(genreIds);
  }
  
  render() {
    console.log(this.state)
    return (
      <div className="questionnaire">
          <Link to='/'>
          <button type="button" className="btn">Submit</button>
          </Link>
          <Grid container>
            {this.state.artists.artists.items.map((icon, index) => (
              <Grid item sm key={index}>
                <div className={icon.selected ? "withBorder" : "noBorder"} >
                  <img
                    src={icon.images[1].url}
                    width="300"
                    height="300"
                    id={index}
                    alt={index}
                    onClick={(e) => this.onIconClick(e)} />
                  <p>{icon.name}</p>
                </div>
              </Grid>
            ))}
          </Grid>     
      </div>
    );
  }
}

export default Questionarre2;
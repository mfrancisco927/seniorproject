import React , { Component } from 'react';
import Grid from '@material-ui/core/Grid';
import './Questionnaire.css';
import '../../api/recommendationApi';
import { postGenreSeeds } from '../../api/recommendationApi';
import Placeholder from '../images/genres/placeholder.png';
import { withRouter } from 'react-router-dom';

class Questionarre1 extends Component {
 
  constructor(props) {
    
    super(props)
    /*
     * TO-DO:
     * Get images for each genre
     */
    this.state = {
      genres: {
        acoustic: {
          id: "acoustic",
          spotifyid: "acoustic",
          name: "acoustic",
          image: require('../images/genres/placeholder.png'),
          selected: false,
        },
        afrobeat: {
          id: "afrobeat",
          spotifyid: "afrobeat",
          name: "afrobeat",
          image: require('../images/genres/placeholder.png'),
          selected: false,
        },
        altrock: {
          id: "altrock",
          spotifyid: "alt-rock",
          name: "alt rock",
          image: require('../images/genres/placeholder.png'),
          selected: false,
        },
        alternative: {
          id: "alternative",
          spotifyid: "alternative",
          name: "alternative",
          image: require('../images/genres/placeholder.png'),
          selected: false,
        },
        ambient: {
          id: "ambient",
          spotifyid: "ambient",
          name: "ambient",
          image: require('../images/genres/placeholder.png'),
          selected: false,
        },
        anime: {
          id: "anime",
          spotifyid: "anime",
          name: "anime",
          image: require('../images/genres/placeholder.png'),
          selected: false,
        },
        blackmetal: {
          id: "blackmetal",
          spotifyid: "black-metal",
          name: "black metal",
          image: require('../images/genres/placeholder.png'),
          selected: false,
        },
        bluegrass: {
          id: "bluegrass",
          spotifyid: "bluegrass",
          name: "bluegrass",
          image: require('../images/genres/placeholder.png'),
          selected: false,
        },
        blues: {
          id: "blues",
          spotifyid: "blues",
          name: "blues",
          image: require('../images/genres/placeholder.png'),
          selected: false,
        },
        bossanova: {
          id: "bossanova",
          spotifyid: "bossanova",
          name: "bossanova",
          image: require('../images/genres/placeholder.png'),
          selected: false,
        },
        brazil: {
          id: "brazil",
          spotifyid: "brazil",
          name: "brazil",
          image: require('../images/genres/placeholder.png'),
          selected: false,
        },
        breakbeat: {
          id: "breakbeat",
          spotifyid: "breakbeat",
          name: "breakbeat",
          image: require('../images/genres/placeholder.png'),
          selected: false,
        },
        british: {
          id: "british",
          spotifyid: "british",
          name: "british",
          image: require('../images/genres/placeholder.png'),
          selected: false,
        },
        cantopop: {
          id: "cantopop",
          spotifyid: "cantopop",
          name: "cantopop",
          image: require('../images/genres/placeholder.png'),
          selected: false,
        },
        chicagohouse: {
          id: "chicagohouse",
          spotifyid: "chicago-house",
          name: "chicago house",
          image: require('../images/genres/placeholder.png'),
          selected: false,
        },
        children: {
          id: "children",
          spotifyid: "children",
          name: "children",
          image: require('../images/genres/placeholder.png'),
          selected: false,
        },
        chill: {
          id: "chill",
          spotifyid: "chill",
          name: "chill",
          image: require('../images/genres/placeholder.png'),
          selected: false,
        },
        classical: {
          id: "classical",
          spotifyid: "classical",
          name: "classical",
          image: require('../images/genres/placeholder.png'),
          selected: false,
        },
        club: {
          id: "club",
          spotifyid: "club",
          name: "club",
          image: require('../images/genres/placeholder.png'),
          selected: false,
        },
        comedy: {
          id: "comedy",
          spotifyid: "comedy",
          name: "comedy",
          image: require('../images/genres/placeholder.png'),
          selected: false,
        },
        country: {
          id: "country",
          spotifyid: "country",
          name: "country",
          image: require('../images/genres/placeholder.png'),
          selected: false,
        },
        dance: {
          id: "dance",
          spotifyid: "dance",
          name: "dance",
          image: require('../images/genres/placeholder.png'),
          selected: false,
        },
        dancehall: {
          id: "dancehall",
          spotifyid: "dancehall",
          name: "dancehall",
          image: require('../images/genres/placeholder.png'),
          selected: false,
        },
        deathmetal: {
          id: "deathmetal",
          spotifyid: "death-metal",
          name: "death metal",
          image: require('../images/genres/placeholder.png'),
          selected: false,
        },
        deephouse: {
          id: "deephouse",
          spotifyid: "deep-house",
          name: "deep house",
          image: require('../images/genres/placeholder.png'),
          selected: false,
        },
        detroittechno: {
          id: "detroittechno",
          spotifyid: "detroit-techno",
          name: "detroit techno",
          image: require('../images/genres/placeholder.png'),
          selected: false,
        },
        disco: {
          id: "disco",
          spotifyid: "disco",
          name: "disco",
          image: require('../images/genres/placeholder.png'),
          selected: false,
        },
        drumandbass: {
          id: "drumandbass",
          spotifyid: "drum-and-bass",
          name: "D&B",
          image: require('../images/genres/placeholder.png'),
          selected: false,
        },
        dub: {
          id: "dub",
          spotifyid: "dub",
          name: "dub",
          image: require('../images/genres/placeholder.png'),
          selected: false,
        },
        dubstep: {
          id: "dubstep",
          spotifyid: "dubstep",
          name: "dubstep",
          image: require('../images/genres/placeholder.png'),
          selected: false,
        },
        edm: {
          id: "edm",
          spotifyid: "edm",
          name: "edm",
          image: require('../images/genres/placeholder.png'),
          selected: false,
        },
        electro: {
          id: "electro",
          spotifyid: "electro",
          name: "electro",
          image: require('../images/genres/placeholder.png'),
          selected: false,
        },
        electronic: {
          id: "electronic",
          spotifyid: "electronic",
          name: "electronic",
          image: require('../images/genres/placeholder.png'),
          selected: false,
        },
        emo: {
          id: "emo",
          spotifyid: "emo",
          name: "emo",
          image: require('../images/genres/placeholder.png'),
          selected: false,
        },
        folk: {
          id: "folk",
          spotifyid: "folk",
          name: "folk",
          image: require('../images/genres/placeholder.png'),
          selected: false,
        },
        forro: {
          id: "forro",
          spotifyid: "forro",
          name: "forro",
          image: require('../images/genres/placeholder.png'),
          selected: false,
        },
        french: {
          id: "french",
          spotifyid: "french",
          name: "french",
          image: require('../images/genres/placeholder.png'),
          selected: false,
        },
        funk: {
          id: "funk",
          spotifyid: "funk",
          name: "funk",
          image: require('../images/genres/placeholder.png'),
          selected: false,
        },
        garage: {
          id: "garage",
          spotifyid: "garage",
          name: "garage",
          image: require('../images/genres/placeholder.png'),
          selected: false,
        },
        german: {
          id: "german",
          spotifyid: "german",
          name: "german",
          image: require('../images/genres/placeholder.png'),
          selected: false,
        },
        gospel: {
          id: "gospel",
          spotifyid: "gospel",
          name: "gospel",
          image: require('../images/genres/placeholder.png'),
          selected: false,
        },
        goth: {
          id: "goth",
          spotifyid: "goth",
          name: "goth",
          image: require('../images/genres/placeholder.png'),
          selected: false,
        },
        grindcore: {
          id: "grindcore",
          spotifyid: "grindcore",
          name: "grindcore",
          image: require('../images/genres/placeholder.png'),
          selected: false,
        },
        groove: {
          id: "groove",
          spotifyid: "groove",
          name: "groove",
          image: require('../images/genres/placeholder.png'),
          selected: false,
        },
        grunge: {
          id: "grunge",
          spotifyid: "grunge",
          name: "grunge",
          image: require('../images/genres/placeholder.png'),
          selected: false,
        },
        guitar: {
          id: "guitar",
          spotifyid: "guitar",
          name: "guitar",
          image: require('../images/genres/placeholder.png'),
          selected: false,
        },
        happy: {
          id: "happy",
          spotifyid: "happy",
          name: "happy",
          image: require('../images/genres/placeholder.png'),
          selected: false,
        },
        hardrock: {
          id: "hardrock",
          spotifyid: "hard-rock",
          name: "hard rock",
          image: require('../images/genres/placeholder.png'),
          selected: false,
        },
        hardcore: {
          id: "hardcore",
          spotifyid: "hardcore",
          name: "hardcore",
          image: require('../images/genres/placeholder.png'),
          selected: false,
        },
        hardstyle: {
          id: "hardstyle",
          spotifyid: "hardstyle",
          name: "hardstyle",
          image: require('../images/genres/placeholder.png'),
          selected: false,
        },
        heavymetal: {
          id: "heavymetal",
          spotifyid: "heavy-metal",
          name: "heavy metal",
          image: require('../images/genres/placeholder.png'),
          selected: false,
        },
        hiphop: {
          id: "hiphop",
          spotifyid: "hip-hop",
          name: "hip hop",
          image: require('../images/genres/placeholder.png'),
          selected: false,
        },
        holidays: {
          id: "holidays",
          spotifyid: "holidays",
          name: "holidays",
          image: require('../images/genres/placeholder.png'),
          selected: false,
        },
        honkytonk: {
          id: "honkytonk",
          spotifyid: "honky-tonk",
          name: "honky tonk",
          image: require('../images/genres/placeholder.png'),
          selected: false,
        },
        house: {
          id: "house",
          spotifyid: "house",
          name: "house",
          image: require('../images/genres/placeholder.png'),
          selected: false,
        },
        idm: {
          id: "idm",
          spotifyid: "idm",
          name: "idm",
          image: require('../images/genres/placeholder.png'),
          selected: false,
        },
        indian: {
          id: "indian",
          spotifyid: "indian",
          name: "indian",
          image: require('../images/genres/placeholder.png'),
          selected: false,
        },
        indie: {
          id: "indie",
          spotifyid: "indie",
          name: "indie",
          image: require('../images/genres/placeholder.png'),
          selected: false,
        },
        indiepop: {
          id: "indiepop",
          spotifyid: "indie-pop",
          name: "indie pop",
          image: require('../images/genres/placeholder.png'),
          selected: false,
        },
        industrial: {
          id: "industrial",
          spotifyid: "industrial",
          name: "industrial",
          image: require('../images/genres/placeholder.png'),
          selected: false,
        },
        iranian: {
          id: "iranian",
          spotifyid: "iranian",
          name: "iranian",
          image: require('../images/genres/placeholder.png'),
          selected: false,
        },
        jdance: {
          id: "jdance",
          spotifyid: "j-dance",
          name: "j-dance",
          image: require('../images/genres/placeholder.png'),
          selected: false,
        },
        jidol: {
          id: "jidol",
          spotifyid: "j-idol",
          name: "j-idol",
          image: require('../images/genres/placeholder.png'),
          selected: false,
        },
        jpop: {
          id: "jpop",
          spotifyid: "j-pop",
          name: "j-pop",
          image: require('../images/genres/placeholder.png'),
          selected: false,
        },
        jrock: {
          id: "jrock",
          spotifyid: "j-rock",
          name: "j-rock",
          image: require('../images/genres/placeholder.png'),
          selected: false,
        },
        jazz: {
          id: "jazz",
          spotifyid: "jazz",
          name: "jazz",
          image: require('../images/genres/placeholder.png'),
          selected: false,
        },
        kpop: {
          id: "kpop",
          spotifyid: "k-pop",
          name: "k-pop",
          image: require('../images/genres/placeholder.png'),
          selected: false,
        },
        kids: {
          id: "kids",
          spotifyid: "kids",
          name: "kids",
          image: require('../images/genres/placeholder.png'),
          selected: false,
        },
        latin: {
          id: "latin",
          spotifyid: "latin",
          name: "latin",
          image: require('../images/genres/placeholder.png'),
          selected: false,
        },
        latino: {
          id: "latino",
          spotifyid: "latino",
          name: "latino",
          image: require('../images/genres/placeholder.png'),
          selected: false,
        },
        malay: {
          id: "malay",
          spotifyid: "malay",
          name: "malay",
          image: require('../images/genres/placeholder.png'),
          selected: false,
        },
        mandopop: {
          id: "mandopop",
          spotifyid: "mandopop",
          name: "mandopop",
          image: require('../images/genres/placeholder.png'),
          selected: false,
        },
        metal: {
          id: "metal",
          spotifyid: "metal",
          name: "metal",
          image: require('../images/genres/placeholder.png'),
          selected: false,
        },
        metalcore: {
          id: "metalcore",
          spotifyid: "metalcore",
          name: "metalcore",
          image: require('../images/genres/placeholder.png'),
          selected: false,
        },
        movies: {
          id: "movies",
          spotifyid: "movies",
          name: "movies",
          image: require('../images/genres/placeholder.png'),
          selected: false,
        },
        mpb: {
          id: "mpb",
          spotifyid: "mpb",
          name: "mpb",
          image: require('../images/genres/placeholder.png'),
          selected: false,
        },
        newage: {
          id: "newage",
          spotifyid: "new-age",
          name: "new age",
          image: require('../images/genres/placeholder.png'),
          selected: false,
        },
        opera: {
          id: "opera",
          spotifyid: "opera",
          name: "opera",
          image: require('../images/genres/placeholder.png'),
          selected: false,
        },
        pagode: {
          id: "pagode",
          spotifyid: "pagode",
          name: "pagode",
          image: require('../images/genres/placeholder.png'),
          selected: false,
        },
        party: {
          id: "party",
          spotifyid: "party",
          name: "party",
          image: require('../images/genres/placeholder.png'),
          selected: false,
        },
        philippinesopm: {
          id: "philippinesopm",
          spotifyid: "philippines-opm",
          name: "philippines",
          image: require('../images/genres/placeholder.png'),
          selected: false,
        },
        piano: {
          id: "piano",
          spotifyid: "piano",
          name: "piano",
          image: require('../images/genres/placeholder.png'),
          selected: false,
        },
        pop: {
          id: "pop",
          spotifyid: "pop",
          name: "pop",
          image: require('../images/genres/placeholder.png'),
          selected: false,
        },
        postdubstep: {
          id: "postdubstep",
          spotifyid: "post-dubstep",
          name: "post dubstep",
          image: require('../images/genres/placeholder.png'),
          selected: false,
        },
        powerpop: {
          id: "powerpop",
          spotifyid: "power-pop",
          name: "power pop",
          image: require('../images/genres/placeholder.png'),
          selected: false,
        },
        progressivehouse: {
          id: "progressivehouse",
          spotifyid: "progressive-house",
          name: "progressive house",
          image: require('../images/genres/placeholder.png'),
          selected: false,
        },
        psychrock: {
          id: "psychrock",
          spotifyid: "psych-rock",
          name: "psych rock",
          image: require('../images/genres/placeholder.png'),
          selected: false,
        },
        punk: {
          id: "punk",
          spotifyid: "punk",
          name: "punk",
          image: require('../images/genres/placeholder.png'),
          selected: false,
        },
        punkrock: {
          id: "punkrock",
          spotifyid: "punk-rock",
          name: "punk rock",
          image: require('../images/genres/placeholder.png'),
          selected: false,
        },
        rnb: {
          id: "rnb",
          spotifyid: "r-n-b",
          name: "RnB",
          image: require('../images/genres/placeholder.png'),
          selected: false,
        },
        rainyday: {
          id: "rainyday",
          spotifyid: "rainy-day",
          name: "rainy day",
          image: require('../images/genres/placeholder.png'),
          selected: false,
        },
        reggae: {
          id: "reggae",
          spotifyid: "reggae",
          name: "reggae",
          image: require('../images/genres/placeholder.png'),
          selected: false,
        },
        reggaeton: {
          id: "reggaeton",
          spotifyid: "reggaeton",
          name: "reggaeton",
          image: require('../images/genres/placeholder.png'),
          selected: false,
        },
        roadtrip: {
          id: "roadtrip",
          spotifyid: "road-trip",
          name: "road trip",
          image: require('../images/genres/placeholder.png'),
          selected: false,
        },
        rock: {
          id: "rock",
          spotifyid: "rock",
          name: "rock",
          image: require('../images/genres/placeholder.png'),
          selected: false,
        },
        rockabilly: {
          id: "rockabilly",
          spotifyid: "rockabilly",
          name: "rockabilly",
          image: require('../images/genres/placeholder.png'),
          selected: false,
        },
        romance: {
          id: "romance",
          spotifyid: "romance",
          name: "romance",
          image: require('../images/genres/placeholder.png'),
          selected: false,
        },
        sad: {
          id: "sad",
          spotifyid: "sad",
          name: "sad",
          image: require('../images/genres/placeholder.png'),
          selected: false,
        },
        salsa: {
          id: "salsa",
          spotifyid: "salsa",
          name: "salsa",
          image: require('../images/genres/placeholder.png'),
          selected: false,
        },
        samba: {
          id: "samba",
          spotifyid: "samba",
          name: "samba",
          image: require('../images/genres/placeholder.png'),
          selected: false,
        },
        sertanejo: {
          id: "sertanejo",
          spotifyid: "sertanejo",
          name: "sertanejo",
          image: require('../images/genres/placeholder.png'),
          selected: false,
        },
        ska: {
          id: "ska",
          spotifyid: "ska",
          name: "ska",
          image: require('../images/genres/placeholder.png'),
          selected: false,
        },
        sleep: {
          id: "sleep",
          spotifyid: "sleep",
          name: "sleep",
          image: require('../images/genres/placeholder.png'),
          selected: false,
        },
        songwriter: {
          id: "songwriter",
          spotifyid: "songwriter",
          name: "songwriter",
          image: require('../images/genres/placeholder.png'),
          selected: false,
        },
        soul: {
          id: "soul",
          spotifyid: "soul",
          name: "soul",
          image: require('../images/genres/placeholder.png'),
          selected: false,
        },
        spanish: {
          id: "spanish",
          spotifyid: "spanish",
          name: "spanish",
          image: require('../images/genres/placeholder.png'),
          selected: false,
        },
        study: {
          id: "study",
          spotifyid: "study",
          name: "study",
          image: require('../images/genres/placeholder.png'),
          selected: false,
        },
        summer: {
          id: "summer",
          spotifyid: "summer",
          name: "summer",
          image: require('../images/genres/placeholder.png'),
          selected: false,
        },
        swedish: {
          id: "swedish",
          spotifyid: "swedish",
          name: "swedish",
          image: require('../images/genres/placeholder.png'),
          selected: false,
        },
        synthpop: {
          id: "synthpop",
          spotifyid: "synth-pop",
          name: "synth pop",
          image: require('../images/genres/placeholder.png'),
          selected: false,
        },
        tango: {
          id: "tango",
          spotifyid: "tango",
          name: "tango",
          image: require('../images/genres/placeholder.png'),
          selected: false,
        },
        techno: {
          id: "techno",
          spotifyid: "techno",
          name: "techno",
          image: require('../images/genres/placeholder.png'),
          selected: false,
        },
        trance: {
          id: "trance",
          spotifyid: "trance",
          name: "trance",
          image: require('../images/genres/placeholder.png'),
          selected: false,
        },
        triphop: {
          id: "triphop",
          spotifyid: "trip-hop",
          name: "trip-hop",
          image: require('../images/genres/placeholder.png'),
          selected: false,
        },
        turkish: {
          id: "turkish",
          spotifyid: "turkish",
          name: "turkish",
          image: require('../images/genres/placeholder.png'),
          selected: false,
        },
        workout: {
          id: "workout",
          spotifyid: "work-out",
          name: "work out",
          image: require('../images/genres/placeholder.png'),
          selected: false,
        },
        worldmusic: {
          id: "worldmusic",
          spotifyid: "world-music",
          name: "world music",
          image: require('../images/genres/placeholder.png'),
          selected: false,
        },
      }
    }
    this.sendGenreSeeds = this.sendGenreSeeds.bind(this);
  }
  onIconClick(event) {
    let newState = Object.assign({}, this.state);

    newState.genres[event.target.id].selected = !newState.genres[event.target.id].selected;
    this.setState({
      newState,
    })
  }

  sendGenreSeeds(){
    let genreIds = [];
    Object.entries(this.state.genres).forEach(genreKV => {
      if(genreKV[1].selected){
        genreIds.push(genreKV[1].spotifyid);
      }
    });
    console.log(genreIds);
    postGenreSeeds(genreIds).then((response) => {
        this.props.history.push('/Questionnaire2')
      });
  }

  render() {
    return (   
        <div className="questionnaire">
              <button 
                type="button" 
                className="btn"
                onClick={this.sendGenreSeeds}
              >
                Submit
              </button>
            <Grid container>
              {Object.keys(this.state.genres).map(icon => (
                <Grid item sm key={this.state.genres[icon]['id']}>
                  <div className={this.state.genres[icon]['selected'] ? "withBorder" : "noBorder"} >
                    <img
                      src={Placeholder}
                      width="300"
                      height="300"
                      id={this.state.genres[icon]['id']}
                      alt=""
                      onClick={(e) => this.onIconClick(e)} />

                    <p>{this.state.genres[icon]['name']} </p>
                  </div>
                </Grid>
              ))}

            </Grid>
        </div>
    );
  }
}

export default withRouter(Questionarre1);
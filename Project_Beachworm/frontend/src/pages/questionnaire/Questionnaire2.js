import React , { Component } from 'react';
import { Link } from 'react-router-dom';
import Grid from '@material-ui/core/Grid';
import '../../api/recommendationApi';
import './Questionnaire.css';

class Questionarre2 extends Component {
  constructor(props) {
    super(props)

    this.state = obtainArtists();
    Object.entries(this.state.artists.items).forEach(artistsKV =>
        artistsKV.selected = false
      )
  }
  onIconClick(event) {


    let newState = Object.assign({}, this.state);

    newState.artists[event.target.id].selected = !newState.artists[event.target.id].selected;
    this.setState({
      newState,
    })
  }

  render() {
    return (
      <div className="questionnaire">
          <Grid container>
            {Object.keys(this.state.artists).map(icon => (
              <Grid item sm key={this.state.artists[icon]['id']}>
                <div className={this.state.artists[icon]['selected'] ? "withBorder" : "noBorder"} >
                  <img
                    src={this.state.artists[icon]['image']}
                    id={this.state.artists[icon]['id']}
                    alt={this.state.artists[icon]['name']}
                    onClick={(e) => this.onIconClick(e)} />

                  <p>{this.state.artists[icon]['name']} </p>
                </div>
              </Grid>
            ))}

          </Grid>
          <Link to='/'>
          <button type="button" className="btn">Submit</button>
          </Link>
      </div>
    );
  }
}

export default Questionarre2;
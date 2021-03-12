import React , { Component } from 'react';
import { Link } from 'react-router-dom';
import Grid from '@material-ui/core/Grid';
import './Questionnaire.css';

class Questionarre1 extends Component {
  constructor(props) {
    super(props)

    this.state = {
      genres: {
        a: {
          id: "a",
          name: "rock",
          image: 'https://i.scdn.co/image/7ddd6fa5cf78aee2f2e8b347616151393022b7d9',
          selected: false,
        },
        b: {
          id: "b",
          name: "indie",
          image: 'https://i.scdn.co/image/7ddd6fa5cf78aee2f2e8b347616151393022b7d9',
          selected: false,
        },
        c: {
          id: "c",
          name: "rap",
          image: 'https://i.scdn.co/image/7ddd6fa5cf78aee2f2e8b347616151393022b7d9',
          selected: false,
        },
        d: {
          id: "d",
          name: "lo-fi",
          image: 'https://i.scdn.co/image/7ddd6fa5cf78aee2f2e8b347616151393022b7d9',
          selected: false,
        },
        e: {
          id: "e",
          name: "punk",
          image: 'https://i.scdn.co/image/7ddd6fa5cf78aee2f2e8b347616151393022b7d9',
          selected: false,
        },
        f: {
          id: "f",
          name: "pop",
          image: 'https://i.scdn.co/image/7ddd6fa5cf78aee2f2e8b347616151393022b7d9',
          selected: false,
        },
        g: {
          id: "g",
          name: "country",
          image: 'https://i.scdn.co/image/7ddd6fa5cf78aee2f2e8b347616151393022b7d9',
          selected: false,
        },
        h: {
          id: "h",
          name: "electronic",
          image: 'https://i.scdn.co/image/7ddd6fa5cf78aee2f2e8b347616151393022b7d9',
          selected: false,
        },
        i: {
          id: "i",
          name: "alt",
          image: 'https://i.scdn.co/image/7ddd6fa5cf78aee2f2e8b347616151393022b7d9',
          selected: false,
        },
        j: {
          id: "j",
          name: "r&b",
          image: 'https://i.scdn.co/image/7ddd6fa5cf78aee2f2e8b347616151393022b7d9',
          selected: false,
        },
      }
    }
  }
  onIconClick(event) {


    let newState = Object.assign({}, this.state);

    newState.genres[event.target.id].selected = !newState.genres[event.target.id].selected;
    this.setState({
      newState,
    })
  }

  render() {
    return (
        <div className="questionnaire">
            <Grid container>
              {Object.keys(this.state.genres).map(icon => (
                <Grid item sm key={this.state.genres[icon]['id']}>
                  <div className={this.state.genres[icon]['selected'] ? "withBorder" : "noBorder"} >
                    <img
                      src={this.state.genres[icon]['image']}
                      id={this.state.genres[icon]['id']}
                      alt={this.state.genres[icon]['name']}
                      onClick={(e) => this.onIconClick(e)} />

                    <p>{this.state.genres[icon]['name']} </p>
                  </div>
                </Grid>
              ))}

            </Grid>
            <Link to='/questionnaire2'>
            <button type="button" className="btn">Submit</button>
            </Link>
        </div>
    );
  }
}

export default Questionarre1;
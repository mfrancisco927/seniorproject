import React , { Component } from 'react';
import { Link } from 'react-router-dom';
import Grid from '@material-ui/core/Grid';
import './Questionnaire.css';

class Questionarre2 extends Component {
  constructor(props) {
    super(props)

    this.state = {
      artists: {
        a: {
          id: "a",
          name: "(Sandy) Alex G",
          image: 'https://i.scdn.co/image/7ddd6fa5cf78aee2f2e8b347616151393022b7d9',
          selected: false,
        },
        b: {
          id: "b",
          name: "Phobe Bridgers",
          image: 'https://i.scdn.co/image/7ddd6fa5cf78aee2f2e8b347616151393022b7d9',
          selected: false,
        },
        c: {
          id: "c",
          name: "Jimi Hendrix",
          image: 'https://i.scdn.co/image/7ddd6fa5cf78aee2f2e8b347616151393022b7d9',
          selected: false,
        },
        d: {
          id: "d",
          name: "Pink Floyd",
          image: 'https://i.scdn.co/image/7ddd6fa5cf78aee2f2e8b347616151393022b7d9',
          selected: false,
        },
        e: {
          id: "e",
          name: "Denzel Curry",
          image: 'https://i.scdn.co/image/7ddd6fa5cf78aee2f2e8b347616151393022b7d9',
          selected: false,
        },
        f: {
          id: "f",
          name: "David Bowie",
          image: 'https://i.scdn.co/image/7ddd6fa5cf78aee2f2e8b347616151393022b7d9',
          selected: false,
        },
        g: {
          id: "g",
          name: "CASTLEBEAT",
          image: 'https://i.scdn.co/image/7ddd6fa5cf78aee2f2e8b347616151393022b7d9',
          selected: false,
        },
        h: {
          id: "h",
          name: "Anonymus",
          image: 'https://i.scdn.co/image/7ddd6fa5cf78aee2f2e8b347616151393022b7d9',
          selected: false,
        },
        i: {
          id: "i",
          name: "Father John Misty",
          image: 'https://i.scdn.co/image/7ddd6fa5cf78aee2f2e8b347616151393022b7d9',
          selected: false,
        },
        j: {
          id: "j",
          name: "Car Seat Headrest",
          image: 'https://i.scdn.co/image/7ddd6fa5cf78aee2f2e8b347616151393022b7d9',
          selected: false,
        },
      }
    }
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
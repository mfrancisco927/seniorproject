import React from "react";
import { useState } from 'react';
import { useHistory } from 'react-router-dom';
import { refreshToken } from './../../api/authenticationApi';
import { createUser } from './../../api/userApi';
import { useAuth } from './../../hooks/authHooks';
import { useSpotifySdk } from './../../hooks/spotifyHooks';
import { withStyles } from '@material-ui/core/styles';
import Button from '@material-ui/core/Button';
import TextField from "material-ui/TextField";
import "./landing.css";
const validator = require("validator");


function SignInForm () {
    const auth = useAuth();
    const spotify = useSpotifySdk();
    const history = useHistory();
    const { redirect } = history.location.state || {};
    const [username, setUsername] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [access, setAccess] = useState(localStorage.getItem('access_token'))
    const [refresh, setRefresh] = useState(localStorage.getItem('refresh_token'))
    const [error, setErrorText] = useState('');
    const [signinup, setSignInUp] = useState(false);

    const handleChange = (stateSetter) => {
        console.log(email + ' ' + username + ' ' + password);
        return (event) => stateSetter(event.target.value);
        
    };

    const updateTokenVars = () => {
        setAccess(localStorage.getItem('access_token'));
        setRefresh(localStorage.getItem('refresh_token'));
    }

    const refreshTokens = () => {
        refreshToken().then(value => {
            setErrorText();
        }).catch(reason => {
            console.log('Token refresh failed with reason: ', reason)
            setErrorText(reason);
        });
        
        updateTokenVars();
    }

    const deleteTokens = () => {
        auth.signOut(updateTokenVars);
    }

    const validateForm = (email, username, password) => {
        if(password !== confirmPassword){
            console.log('password validation fail')
        } else {
            createNewUser(email, username, password);
        }
    };

    const createNewUser = (event, email, username, password) => {
        event.preventDefault();
        createUser(email, username, password).then(value => {
            console.log(value);
            signInUser();
            alert('Created user with username ' + username +  ' and password ' + password)
        }).catch(reason => {
            console.log('new user rejected', reason);
        });
    };

    const signInUser = (event, username, password) => {
        event.preventDefault();
        auth.signIn(username, password).then(value => {
            updateTokenVars();
            spotify.clearAll();
            setErrorText();
            if (redirect) {
              history.replace(redirect);
            }
        }).catch(reason => {
            console.log('Sign in failed with reason ', reason)
            setErrorText(reason);
        });
    }

    const StyledButton = withStyles({
        root: {
          background: 'linear-gradient(45deg, #FE6B8B 30%, #FF8E53 90%)',
          borderRadius: 3,
          border: 0,
          color: 'white',
          height: 48,
          padding: '0 30px',
          margin: 15,
          boxShadow: '0 3px 5px 2px rgba(255, 105, 135, .3)',
        },
        label: {
          textTransform: 'capitalize',
        },
      })(Button);
        return (
            signinup ? (
            <body className="signinup-wrapper">
                <div className="loginBox">
                <h1>Sign Up</h1>
                <form onSubmit={(event) => createNewUser(event, email, username, password)}>
                    <TextField
                        name="username"
                        floatingLabelText="username"
                        value={username}
                        onChange={handleChange(setUsername)}
                    />
                    <br />
                    <TextField
                        type="email"
                        name="email"
                        floatingLabelText="email"
                        value={email}
                        onChange={handleChange(setEmail)}
                    />
                    <br />
                    <TextField
                        type="password"
                        name="password"
                        floatingLabelText="password"
                        value={password}
                        onChange={handleChange(setPassword)}
                    />
                    <br />
                    <TextField
                        type="password"
                        name="pwconfirm"
                        floatingLabelText="confirm password"
                        value={confirmPassword}
                        onChange={handleChange(setConfirmPassword)}
                    />
                    <br />
                    <StyledButton type='submit' onClick={console.log('clicked!')}>
                        SUBMIT
                    </StyledButton>
                    <StyledButton onClick={() => setSignInUp(!signinup)}>
                        SIGN IN
                    </StyledButton>

                </form>
                </div>
            </body>
            ) : (
            <body className="signinup-wrapper">
                <div className="loginBox">
                <h1>Sign In</h1>

                <form onSubmit={(event) => signInUser(event, username, password)}>
                    <TextField
                        name="username"
                        floatingLabelText="username"
                        value={username}
                        onChange={handleChange(setUsername)}
                    />
                    <br />
                    <TextField
                        type="password"
                        name="password"
                        floatingLabelText="password"
                        value={password}
                        onChange={handleChange(setPassword)}
                    />
                    <br />
                    <StyledButton type='submit' onClick={console.log('clicked!')}>
                        SUBMIT
                    </StyledButton>
                    <StyledButton onClick={() => setSignInUp(!signinup)}>
                        SIGN UP
                    </StyledButton>
                </form>
                </div>
            </body>
            )
        ); 
}

export default SignInForm;

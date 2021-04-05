import React from "react";
import { useState } from 'react';
import { useHistory } from 'react-router-dom';
import { createUser } from './../../api/userApi';
import { useAuth } from './../../hooks/authHooks';
import { useSpotifySdk } from './../../hooks/spotifyHooks';
import { withStyles } from '@material-ui/core/styles';
import Button from '@material-ui/core/Button';
import TextField from "material-ui/TextField";
import "./landing.css";
// import validator from 'validator';

function SignInForm () {
    const auth = useAuth();
    const spotify = useSpotifySdk();
    const history = useHistory();
    const { redirect } = history.location.state || {};
    const [username, setUsername] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [error, setError] = useState(null);
    const [signinup, setSignInUp] = useState(false);

    const handleChange = (stateSetter) => {
        // console.log(email + ' ' + username + ' ' + password);
        return (event) => stateSetter(event.target.value);
    };

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
            console.log('Created new user', value);
            signInUser(null, username, password);
            // alert('Created user with username ' + username +  ' and password ' + password)
        }).catch(reason => {
            console.log('new user rejected', reason);
        });
    };

    const signInUser = (event, username, password) => {
        if (event) {
            event.preventDefault();
        }

        auth.signIn(username, password).then(() => {
            spotify.clearAll();
            setError();
            if (redirect) {
                history.replace(redirect);
            } else {
                history.push('/home');
            }
        }).catch(reason => {
            console.log('Sign in failed with reason ', reason)
            setError(reason);
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

    const FullWidthButton = withStyles({
        root: {
            margin: '0 auto 2em',
            padding: 0,
            width: '75%',
        }
    })(StyledButton);

    return (
        <div className="signinup-wrapper">
            <div className="loginBox">
                {signinup ? (
                    <>
                        <h1>Sign Up</h1>
                        <form
                        className="login-form"
                        onSubmit={(event) => createNewUser(event, email, username, password)}>
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
                            <StyledButton type="submit">
                                SUBMIT
                            </StyledButton>
                            <StyledButton onClick={() => setSignInUp(!signinup)}>
                                SIGN IN
                            </StyledButton>
                            <FullWidthButton onClick={() => history.push('/home')}>START GUEST SESSION</FullWidthButton>
                        </form>
                    </>
                ) : (
                    <>
                        <h1>Sign In</h1>
                        <form
                        className="signup-form"
                        onSubmit={(event) => signInUser(event, username, password)}>
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
                            <StyledButton type="submit">
                                SUBMIT
                            </StyledButton>
                            <StyledButton onClick={() => setSignInUp(!signinup)}>
                                SIGN UP
                            </StyledButton>
                            <FullWidthButton onClick={() => history.push('/home')}>START GUEST SESSION</FullWidthButton>
                        </form>
                    </>
                )}
            </div>
        </div>
    ); 
}

export default SignInForm;

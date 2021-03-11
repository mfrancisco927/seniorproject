import { useState } from 'react';
import { signIn, refreshToken } from './../../api/authenticationApi';

function Landing() {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [errorText, setErrorText] = useState();
    const [access, setAccess] = useState(localStorage.getItem('access_token'))
    const [refresh, setRefresh] = useState(localStorage.getItem('refresh_token'))

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
        localStorage.removeItem('access_token');
        localStorage.removeItem('refresh_token');
        updateTokenVars();
    }

    const updateTokenVars = () => {
        setAccess(localStorage.getItem('access_token'));
        setRefresh(localStorage.getItem('refresh_token'));
    }

    const handleChange = (stateSetter) => {
        return (event) => stateSetter(event.target.value);
    }

    const handleSubmit = (event) => {
        signIn(username, password).then(value => {
            updateTokenVars();
            setErrorText();
        }).catch(reason => {
            console.log('Sign in failed with reason ', reason)
            setErrorText(reason);
        });
        event.preventDefault();
    }

    const signInForm = (
        <form onSubmit={handleSubmit}>
            <label>
                Username:
                <input type="text"
                    placeholder="Enter username"
                    name="uname"
                    required
                    onChange={handleChange(setUsername)}
                />
            </label>
            <label>
                Password:
                <input type="password"
                    placeholder="Enter password"
                    name="psw"
                    required
                    onChange={handleChange(setPassword)}
                />
            </label>
            <input type="submit" value="Submit" />
        </form>
    )

    return (
        <div>
            <p>Landing!</p>
            <h3>Testing notes</h3>
            <p>
                Users must be created in the db to test here! As long as you have a
                superuser, which you can make with
            </p>
            <code>
                python manage.py createsuperuser
            </code>
            <p>you can then create as many accounts as you want through
                <a href="localhost:8000/admin"> /admin </a>
                once signed in
            </p>
            <p>After clearing local storage, user must sign in again to regain access token</p>
            {signInForm}
            <button onClick={refreshTokens}>Refresh</button>
            <button onClick={deleteTokens} >Clear local storage</button>
            <p>Access token: {access}</p>
            <p>Refresh token: {refresh}</p>
            <p>{errorText ? 'Error text: ' + errorText : ''}</p>
        </div>
    );
}

export default Landing;
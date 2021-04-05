import SignIn from './SignIn';
import MuiThemeProvider from "material-ui/styles/MuiThemeProvider";
import "./landing.css";

function Landing() {
    return (
        <MuiThemeProvider>
            <SignIn />
        </MuiThemeProvider>
    )
}

export default Landing;
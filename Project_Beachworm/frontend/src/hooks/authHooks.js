import { useContext, createContext, useState } from "react";
import { signIn as apiSignIn }  from '../api/authenticationApi';

/* This code is largely adapted from https://reactrouter.com/web/example/auth-workflow
* `authContext`, `ProvideAuth`, `useAuth` and `useProvideAuth`
* refer to: https://usehooks.com/useAuth/
*/
const authContext = createContext();

export function ProvideAuth({ children }) {
  const auth = useProvideAuth();
  return (
    <authContext.Provider value={auth}>
      {children}
    </authContext.Provider>
  );
}

export function useAuth() {
  return useContext(authContext);
}

function useProvideAuth() {
  const [user, setUser] = useState(null);

  const signIn = (user, pass, cb) => {
    return apiSignIn(user, pass).then(result => {
      setUser(user);
      if (cb) {
        cb();
      }
    });
  };

  const signOut = cb => {
    localStorage.removeItem('refresh_token');
    localStorage.removeItem('access_token');
    setUser(null);
    if (cb) {
      cb();
    }
  };

  return {
    user,
    signIn,
    signOut
  };
}
import { useContext, createContext, useState, useEffect } from "react";
import { signIn as apiSignIn }  from '../api/authenticationApi';
import { getCurrentUser }  from '../api/userApi';

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
  const [user, setUser] = useState(localStorage.getItem('access_token'));
  const [id, setId] = useState(null);

  useEffect(() => {
    const updateUser = async () => {
      console.log('New auth detected. Fetching current user details');
      await getCurrentUser().then(value => {
        setId(_prev => value.id);
      });
    };
    updateUser();
  }, [user]);

  const signIn = (user, pass, cb) => {
    console.log('attempting sign in');
    return apiSignIn(user, pass).then(result => {
      setUser(user);
      if (cb) {
        cb();
      }
      return user;
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
    id,
    signIn,
    signOut
  };
}
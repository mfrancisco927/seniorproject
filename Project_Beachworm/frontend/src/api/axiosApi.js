import { useEffect } from 'react';
import axios from 'axios';
import { useAuth } from './../hooks/authHooks';
import { createBrowserHistory } from 'history';

console.log('Initializing axios api');

const baseUrl = `${process.env.REACT_APP_API_URL}/api/`;

console.log('API located at ' + baseUrl);

// // from Django tutorial webpage
// function getCookie(name) {
//     let cookieValue = null;
//     if (document.cookie && document.cookie !== '') {
//         const cookies = document.cookie.split(';');
//         for (let i = 0; i < cookies.length; i++) {
//             const cookie = cookies[i].trim();
//             // Does this cookie string begin with the name we want?
//             if (cookie.substring(0, name.length + 1) === (name + '=')) {
//                 cookieValue = decodeURIComponent(cookie.substring(name.length + 1));
//                 break;
//             }
//         }
//     }
//     return cookieValue;
// }

const axiosInstance = axios.create({
    baseURL: baseUrl,
    timeout: 40000,
    headers: {
        'Content-Type': 'application/json',
        'accept': 'application/json',
        // 'X-CSRFToken': getCookie('csrftoken'),
    }
});

export const ApiInterceptor = ({children}) => {
  const auth = useAuth();
  // const history = useHistory();
  // on initial load, add the interceptors. this is in a functional component so we have
  // access to the auth and history hook and can force sign-out where appropriate
  useEffect(() => {
    axiosInstance.interceptors.response.use(
      response => response,
      error => {
        const originalRequest = error.config;
        
        // if we're trying to get a new JWT token and we got a 401
        if (originalRequest.baseURL === baseUrl
          && originalRequest.url === '/token/refresh/'
          && auth.id
          && error.response
          && error.response.status === 401) {
            console.log('Looks like we have an invalid refresh token. Forcing a sign-out.');
            auth.signOut();
            createBrowserHistory().push('/');
            window.location.reload();
            // history.push('/');
        // if we're trying to hit one of our own endpoints, we are signed in, and we still got a 401
        } else if (originalRequest.baseURL === baseUrl
              && originalRequest.url !== '/token/obtain/'
              && error.response
              && error.response.status === 401
              && error.response.statusText === "Unauthorized"
              && auth.id) {
            const responseData = error.response.data;
            if (originalRequest.url === '/spotify/refresh-token/'
                  && responseData
                  && responseData.access_token) {
              if (responseData.access_token.includes('no refresh token')) {
                  console.log('401 error from Spotify refresh. Cannot fulfill request -- user has likely not authenticated.');
              } else if (responseData.access_token.includes('may have been revoked')) {
                  console.log('401 error from Spotify refresh. Access token was likely revoked.');
              }
            } else if (responseData.code !== 'user_inactive') {
              console.log('401 error on API request. Attempting to retrieve new JWT access token.');
              return axiosInstance
                .post('/token/refresh/', {refresh: auth.tokens.refresh})
                .then(response => {
                    localStorage.setItem('refresh_token', response.data.refresh);
  
                    axiosInstance.defaults.headers['Authorization'] = "JWT " + response.data.access;
                    originalRequest.headers['Authorization'] = "JWT " + response.data.access;
  
                    return axiosInstance(originalRequest);
                });
            }
        } else if (originalRequest.baseURL === baseUrl
              && originalRequest.url !== '/spotify/refresh-token/'
              && error.response
              && error.response.status === 401) {
          // 401 case where we're hitting our own endpoints and DON'T have a refresh token
        } else {
          // we're getting something other than a 401 or it's someone else's api
          console.log('Error on axios api call! Original request:', originalRequest);
        }
        return Promise.reject(error);
      }
    );
  }, [auth]);

  return children;
}

export default axiosInstance;
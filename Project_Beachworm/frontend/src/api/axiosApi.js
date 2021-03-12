import axios from 'axios';

const baseUrl = 'http://127.0.0.1:8000/api/';

const storedAccessToken = localStorage.getItem('access_token');

// from Django tutorial webpage
function getCookie(name) {
    let cookieValue = null;
    if (document.cookie && document.cookie !== '') {
        const cookies = document.cookie.split(';');
        for (let i = 0; i < cookies.length; i++) {
            const cookie = cookies[i].trim();
            // Does this cookie string begin with the name we want?
            if (cookie.substring(0, name.length + 1) === (name + '=')) {
                cookieValue = decodeURIComponent(cookie.substring(name.length + 1));
                break;
            }
        }
    }
    return cookieValue;
}

const axiosInstance = axios.create({
    baseURL: baseUrl,
    timeout: 5000,
    headers: {
        'Authorization': storedAccessToken ? "JWT " + storedAccessToken : null,
        'Content-Type': 'application/json',
        'accept': 'application/json',
        'X-CSRFToken': getCookie('csrftoken'),
    }
});

axiosInstance.interceptors.response.use(
    response => response,
    error => {
      const originalRequest = error.config;
      
      if (originalRequest.url !== '/token/obtain/' && error.response && error.response.status === 401 && error.response.statusText === "Unauthorized") {
          const refresh_token = localStorage.getItem('refresh_token');

          return axiosInstance
              .post('/token/refresh/', {refresh: refresh_token})
              .then((response) => {
                  localStorage.setItem('access_token', response.data.access);
                  localStorage.setItem('refresh_token', response.data.refresh);

                  axiosInstance.defaults.headers['Authorization'] = "JWT " + response.data.access;
                  originalRequest.headers['Authorization'] = "JWT " + response.data.access;

                  return axiosInstance(originalRequest);
              })
              .catch(err => {
                  console.log(err)
              });
      }
      return Promise.reject(error);
  }
);

export default axiosInstance;
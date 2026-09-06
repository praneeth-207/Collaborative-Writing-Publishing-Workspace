import axios from 'axios';

// Base API configuration
const api = axios.create({
  baseURL: 'http://localhost:5000/api', // adjust base URL if necessary
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request Interceptor: Attach access token
api.interceptors.request.use(
  (config) => {
    const user = JSON.parse(localStorage.getItem('user'));
    if (user && user.token) {
      config.headers.Authorization = `Bearer ${user.token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response Interceptor: Handle token refresh on 401
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;
    
    // If error is 401 and it's not a retry already
    if (error.response && error.response.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;
      const user = JSON.parse(localStorage.getItem('user'));

      if (user && user.refreshToken) {
        try {
          const res = await axios.post('http://localhost:5000/api/auth/refresh', {
            refreshToken: user.refreshToken,
          });

          // Update user in local storage
          const updatedUser = { ...user, token: res.data.data.token, refreshToken: res.data.data.refreshToken };
          localStorage.setItem('user', JSON.stringify(updatedUser));
          
          // Dispatch a custom event to notify other parts of the app (like AuthContext)
          window.dispatchEvent(new Event('auth-token-refreshed'));

          // Retry the original request
          originalRequest.headers.Authorization = `Bearer ${res.data.data.token}`;
          return api(originalRequest);
        } catch (refreshError) {
          // If refresh fails, log out the user
          localStorage.removeItem('user');
          window.location.href = '/login';
          return Promise.reject(refreshError);
        }
      } else {
        localStorage.removeItem('user');
        window.location.href = '/login';
      }
    }

    return Promise.reject(error);
  }
);

export default api;

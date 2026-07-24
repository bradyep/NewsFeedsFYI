export const REST_DOMAIN = (process.env.NODE_ENV !== 'production') ? 'http://localhost:3000' : window.location.origin;
export const CSRF_TOKEN_URL = REST_DOMAIN + '/authenticate/csrf-token';
export const LOGIN_URL = REST_DOMAIN + '/authenticate';
export const LOGOUT_URL = REST_DOMAIN + '/authenticate/logout';
export const REGISTER_URL = REST_DOMAIN + '/users';

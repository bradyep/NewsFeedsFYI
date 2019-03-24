// export const REST_DOMAIN = 'http://localhost:3000';
export const REST_DOMAIN = (process.env.NODE_ENV !== 'production') ? 'http://localhost:3000' : window.location.origin;

import { io } from 'socket.io-client';

// "undefined" means the URL will be computed from the `window.location` object
const URL =
  process.env.NODE_ENV === 'production'
    ? 'https://tweetly.onrender.com'
    : 'http://192.168.1.155:3001';

export const socket = io(URL);

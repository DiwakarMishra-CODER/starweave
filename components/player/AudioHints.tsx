'use client';

import ReactDOM from 'react-dom';

// Every song preview comes from Apple's audio server. Opening the connection
// while the page loads takes its lookup and handshake off the first press of
// play (the request is cross-origin, as the player's is, so it's the same
// connection).
export default function AudioHints() {
  ReactDOM.preconnect('https://audio-ssl.itunes.apple.com', { crossOrigin: 'anonymous' });
  return null;
}

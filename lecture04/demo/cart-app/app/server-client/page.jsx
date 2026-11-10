// Server Component: no 'use client'.
import os from 'node:os'; // Node.js module, not available in the browser
import ClientBox from './ClientBox';

function ServerInfo() {
  return <p>platform: {os.platform()}</p>; // runs on the server
}

export default function Page() {
  return <ClientBox><ServerInfo /></ClientBox>; // the finished output of ServerInfo enters as children
}

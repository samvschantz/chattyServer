// server.js

const express = require('express');
const SocketServer = require('ws').Server;
const uuidv1 = require('uuid/v1');

// Set the port to 3001
const PORT = 3001;

// Create a new express server
const server = express()
   // Make the express server serve static assets (html, javascript, css) from the /public folder
  .use(express.static('public'))
  .listen(PORT, '0.0.0.0', 'localhost', () => console.log(`Listening on ${ PORT }`));

// Create the WebSockets server
const wss = new SocketServer({ server });

// Set up a callback that will run when a client connects to the server
// When a client connects they are assigned a socket, represented by
// the ws parameter in the callback.

// Broadcast to all.
wss.broadcast = function broadcast(data) {
  wss.clients.forEach(function each(client) {
    if (client.readyState === (require('ws')).OPEN) {
      client.send(data);
    }
  });
};

wss.on('connection', (ws) => {
  console.log('Client connected');

  ws.on('message', (message) => {
    let messageObject = JSON.parse(message);

    const msgOut = {
      id: uuidv1(),
      username : messageObject.username,
      content: messageObject.content,
      type: messageObject.type
    }

    wss.broadcast(JSON.stringify(msgOut));
  })

  const broadcastFriendsCount = () => {
  wss.broadcast(JSON.stringify({
    type: 'numOnline',
    numOnline: wss.clients.size,
  }));
};

wss.on('connection', function connection(socket) {
  broadcastFriendsCount();

  socket.on('close', () => {
    broadcastFriendsCount();
  });
})
  console.log(wss.clients.size);

  // Set up a callback for when a client closes the socket. This usually means they closed their browser.
  ws.on('close', () => console.log('Client disconnected'));
});


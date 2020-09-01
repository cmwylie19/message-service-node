import "dotenv/config"
import express from 'express'
import http from 'http'
import socketIO from 'socket.io'
import { Cache } from './utils/cache'

var app = express();
const server = http.createServer(app);
const io = socketIO(server);
var port = process.env.PORT || 3000;


server.listen(port, () => {
  console.log('Server listening at port %d', port);
});

var numUsers = 0;

const { client, getAsync, delAsync, setAsync, scanAsync } = Cache();

io.on('connection', (socket) => {
  console.log(`Connection ${socket.id}`)


  socket.on("CONCURRENT_USERS", () => {
    scanAsync("concurrent:*").then(results => {
      console.log(JSON.stringify(results))
      //   Promise.all(results.map(result => getAsync(`concurrent:${result}`))).then(concurrents => console.log(JSON.stringify(concurrents)))
    })
  })
  // setInterval(() => socket.broadcast.emit("ONLINE", { username: "Case" }), 5000)
  socket.on("NEW_SESSION", data => {
    client.set(`concurrent:${data}`, socket.id)
  })

  socket.on("LOGOUT", username => client.del(`concurrent:${username}`))
  //socket.on("LOGOUT", username => console.log(`concurrent:${username}`))

  // when the client emits 'new message', this listens and executes
  socket.on('new message', (data) => {
    // we tell the client to execute 'new message'
    socket.broadcast.emit('new message', {
      username: socket.username,
      message: data
    });
  });

  // when the client emits 'add user', this listens and executes
  socket.on('add user', (username) => {
    // if (addedUser) return;

    // we store the username in the socket session for this client
    socket.username = username;
    ++numUsers;
    // addedUser = true;
    socket.emit('login', {
      numUsers: numUsers
    });
    // echo globally (all clients) that a person has connected
    socket.broadcast.emit('user joined', {
      username: socket.username,
      numUsers: numUsers
    });
  });

  // when the client emits 'typing', we broadcast it to others
  socket.on('typing', () => {
    socket.broadcast.emit('typing', {
      username: socket.username
    });
  });

  // when the client emits 'stop typing', we broadcast it to others
  socket.on('stop typing', () => {
    socket.broadcast.emit('stop typing', {
      username: socket.username
    });
  });

  // when the user disconnects.. perform this
  socket.on('disconnect', () => {
    if (true) {
      // --numUsers;

      // echo globally that this client has left
      socket.broadcast.emit('user left', {
        username: socket.username,
        numUsers: numUsers
      });
    }
  });
});

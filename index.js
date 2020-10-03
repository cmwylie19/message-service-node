import "dotenv/config";
import express from "express";
import http from "http";
import socketIO from "socket.io";
import { Cache } from "./utils/cache";

var app = express();
const server = http.createServer(app);
const io = socketIO(server);
var port = process.env.PORT || 3000;

server.listen(port, () => {
  console.log("Server listening at port %d", port);
});

const { client, getAsync, delAsync, setAsync, scanAsync } = Cache();

// io.on("connection", socket => {
//   socket.on("CONNECT", username => {
//     client.set(`concurrent:${username}`, socket.id);
//     client.set(`concurrent2:${socket.id}`, username);
//   });

//   socket.on("CONCURRENT_USERS", () => {
//     scanAsync("concurrent:*").then(results => {
//       console.log("Socket.io " + socket.id);
//       io.to(socket.id).emit("CONCURRENT_USERS", results);
//       console.log(JSON.stringify(results));
//     });
//   });

//   socket.on("LOGIN", username => {
//     socket.username = username;
//     client.set(`concurrent:${username}`, socket.id);
//     client.set(`concurrent2:${socket.id}`, username);
//     socket.broadcast.emit("LOGIN", username);
//   });

//   socket.on("LOGOUT", username => {
//     client.del(`concurrent:${username}`);
//     socket.broadcast.emit("LOGOUT", username);
//   });


//   socket.on("MESSAGE", async message => {
//     console.log("MESSAGE" + message.sender);
//     const { sender, receiver, payload } = message;
//     io.to(await getAsync(`concurrent:${receiver}`)).emit("NEW_MESSAGE", {
//       sender,
//       payload,
//       receiver
//     });
//     io.to(await getAsync(`concurrent:${sender}`)).emit("NEW_MESSAGE", {
//       sender,
//       payload,
//       receiver
//     });
//   });

//   // when the client emits 'typing', we broadcast it to others
//   socket.on("typing", () => {
//     socket.broadcast.emit("typing", {
//       username: socket.username
//     });
//   });

//   // when the client emits 'stop typing', we broadcast it to others
//   socket.on("stop typing", () => {
//     socket.broadcast.emit("stop typing", {
//       username: socket.username
//     });
//   });

//   // TODO Write function to delete concurrent user by id
//   socket.on("disconnect", async () => {
//     getAsync(`concurrent2:${socket.id}`).then(user => {
//       if (user !== null) {
//         console.log(user + " has disconnecte3d");
//         socket.broadcast.emit("LOGOUT", user);
//         client.del(`concurrent2:${socket.id}`);
//         client.del(`concurrent:${username}`);
//       }
//     });
//   });


var numUsers = 0;

io.on('connection', (socket) => {
  var addedUser = false;

  // when the client emits 'new message', this listens and executes
  socket.on('new message', (data) => {
    // we tell the client to execute 'new message'
    socket.broadcast.emit('new message', {
      username: socket.username,
      message: data
    });
  });

  // when the client emits 'add user', this listens and executes
  socket.on('add user', ({ username, name }) => {
    if (addedUser) return;

    client.set(`concurrent:${username}`, `${socket.id}`);
    client.set(`concurrent2: ${socket.id}`, username);

    // we store the username in the socket session for this client
    socket.username = username;
    socket.familyName = name
    ++numUsers;
    addedUser = true;
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
    console.log("TYPING")
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

  socket.on("CONCURRENT_USERS", () => {
    scanAsync("concurrent:*").then(results => {
      io.to(socket.id).emit("CONCURRENT_USERS", results);
    });
  });

  // when the user disconnects.. perform this
  socket.on('disconnect', () => {
    if (addedUser) {
      --numUsers;

      client.del(`concurrent2: ${socket.id}`);
      client.del(`concurrent: ${socket.username}`);

      // echo globally that this client has left
      socket.broadcast.emit('user left', {
        username: socket.username,
        numUsers: numUsers
      });
    }
  });
});

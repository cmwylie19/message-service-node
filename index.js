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

io.on("connection", socket => {
  // console.log(`Connection ${socket.id}`)
  socket.on("CONNECT", username => {
    // socket.username = username;
    client.set(`concurrent:${username}`, socket.id);
    client.set(`concurrent2:${socket.id}`, username);
  });

  socket.on("CONCURRENT_USERS", () => {
    scanAsync("concurrent:*").then(results => {
      console.log("Socket.io " + socket.id);
      io.to(socket.id).emit("CONCURRENT_USERS", results);
      console.log(JSON.stringify(results));
      //   Promise.all(results.map(result => getAsync(`concurrent:${result}`))).then(concurrents => console.log(JSON.stringify(concurrents)))
    });
  });
  // setInterval(() => socket.broadcast.emit("ONLINE", { username: "Case" }), 5000)
  socket.on("LOGIN", username => {
    socket.username = username;
    client.set(`concurrent:${username}`, socket.id);
    client.set(`concurrent2:${socket.id}`, username);
    socket.broadcast.emit("LOGIN", username);
  });

  socket.on("LOGOUT", username => {
    client.del(`concurrent:${username}`);
    socket.broadcast.emit("LOGOUT", username);
  });
  //socket.on("LOGOUT", username => console.log(`concurrent:${username}`)

  socket.on("MESSAGE", async message => {
    console.log("MESSAGE" + message.sender);
    const { sender, receiver, payload } = message;
    io.to(await getAsync(`concurrent:${receiver}`)).emit("NEW_MESSAGE", {
      sender,
      payload,
      receiver
    });
    io.to(await getAsync(`concurrent:${sender}`)).emit("NEW_MESSAGE", {
      sender,
      payload,
      receiver
    });
  });

  // when the client emits 'typing', we broadcast it to others
  socket.on("typing", () => {
    socket.broadcast.emit("typing", {
      username: socket.username
    });
  });

  // when the client emits 'stop typing', we broadcast it to others
  socket.on("stop typing", () => {
    socket.broadcast.emit("stop typing", {
      username: socket.username
    });
  });

  // TODO Write function to delete concurrent user by id
  socket.on("disconnect", async () => {
    getAsync(`concurrent2:${socket.id}`).then(user => {
      if (user !== null) {
        console.log(user + " has disconnecte3d");
        socket.broadcast.emit("LOGOUT", user);
        client.del(`concurrent2:${socket.id}`);
        client.del(`concurrent:${username}`);
      }
    });
  });
});

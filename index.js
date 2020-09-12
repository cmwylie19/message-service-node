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

const { client, getAsync, delAsync, setAsync, scanAsync } = Cache();

io.on('connection', (socket) => {
  console.log(`Connection ${socket.id}`)


  socket.on("CONCURRENT_USERS", () => {
    scanAsync("concurrent:*").then(results => {
      io.to(socket.io).emit("CONCURRENT_USERS", results)
      console.log(JSON.stringify(results))
      //   Promise.all(results.map(result => getAsync(`concurrent:${result}`))).then(concurrents => console.log(JSON.stringify(concurrents)))
    })
  })
  // setInterval(() => socket.broadcast.emit("ONLINE", { username: "Case" }), 5000)
  socket.on("LOGIN", username => {
    client.set(`concurrent:${username}`, socket.id);
    socket.broadcast.emit("LOGIN", username)
  })

  socket.on("LOGOUT", username => {
    client.del(`concurrent:${username}`);
    socket.broadcast.emit("LOGOUT", username)
  })
  //socket.on("LOGOUT", username => console.log(`concurrent:${username}`)

  socket.on("SEND_MESSAGE", async message => {
    console.log("SEND_MESSAGE" + message.sender)
    const { sender, receiver, payload } = message
    io.to(await client.get(`concurrent:${receiver}`)).emit("NEW_MESSAGE", { sender, payload })
  })
  // socket.on("MESSAGE", message => {
  //   const { name, sender, time, payload } = message;
  //   client.rpush(name, `${sender}:${time}:${payload}`)
  //   socket.broadcast.emit("MESSAGE", message)
  // })

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


});

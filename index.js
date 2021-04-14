const express = require("express");
const socket = require("socket.io");
const app = express();

//Starts the server

let server = app.listen(4000, function () {
  console.log("Server is running");
});

app.use(express.static("public"));

//Upgrades the server to accept websockets.

let io = socket(server);

//Triggered when a client is connected.

io.on("connection", function (socket) {
  console.log("User Connected :" + socket.id);
  const userId = socket.id;

  //Triggered when a peer hits the join room button.

  socket.on("join", function (roomName) {
    console.log("join");
    let rooms = io.sockets.adapter.rooms;
    let room = rooms.get(roomName);
    console.log("room", room);

    //room == undefined when no such room exists.
    if (room == undefined) {
      console.log("room created");
      socket.join(roomName);
      socket.emit("created");
    } else if (room.size > 0) {
      //room.size == 1 when one person is inside the room.
      console.log("joined");
      socket.join(roomName);
      socket.emit("joined");
    } else {
      //when there are already two people inside the room.
      console.log("full");
      socket.emit("full");
    }
    console.log(rooms);

    socket.on("disconnect", () => {
      socket.to(roomName).emit("user-disconnected", userId);
    });
  });

  //Triggered when the person who joined the room is ready to communicate.
  socket.on("ready", function (roomName) {
    console.log("ready");
    socket.to(roomName).emit("ready", userId); //Informs the other peer in the room.
  });

  //Triggered when server gets an icecandidate from a peer in the room.

  socket.on("candidate", function (candidate, roomName) {
    console.log("candidate", candidate.candidate);
    // console.log(candidate);
    socket.to(roomName).emit("candidate", candidate); //Sends Candidate to the other peer in the room.
  });

  //Triggered when server gets an offer from a peer in the room.

  socket.on("offer", function (offer, roomName) {
    console.log("offer");
    // x1
    socket.to(roomName).emit("offer", offer, userId); //Sends Offer to the other peer in the room.
  });

  //Triggered when server gets an answer from a peer in the room.

  socket.on("answer", function (answer, roomName) {
    console.log("answer");
    // x1
    socket.to(roomName).emit("answer", answer); //Sends Answer to the other peer in the room.
  });
});

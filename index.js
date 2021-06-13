const express = require("express");
const socket = require("socket.io");
const app = express();
const { v4: uuidV4 } = require("uuid");

//Starts the server
let server = app.listen(4000, function () {
  console.log("Server is running");
});

app.use(express.static("public"));

//Upgrades the server to accept websockets.
let io = socket(server);

// Store in database
const authorizedLinks = [];

//Triggered when a client is connected.
app.get("/generate-room", (req, res) => {
  const newUrl = uuidV4();
  res.send(`/${newUrl}`);
  authorizedLinks.push(newUrl);
  console.log('authorizedLinks', authorizedLinks);
  res.end();
});

app.get("/r/:room", (req, res) => {
  if (authorizedLinks.includes(req.params.room)) {
    console.log('Joining room through link: ' + req.params.room);

    // res.redirect('https://www.yahoo.fr/');
    res.end();
    return;
  }

  console.log('Invalid link: ' + req.params.room);

  // res.redirect('https://www.google.fr/');
  res.end()

  // res.render("room", { roomName: req.params.room });
});

io.on("connection", function (socket) {
  console.log("\x1b[31m", "User Connected :" + socket.id);
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

  socket.on("vue-create", function (callback) {
    const newUrl = uuidV4();

    try {
      authorizedLinks.push(newUrl);
      console.log('authorizedLinks', authorizedLinks);
      socket.join(newUrl);

      let rooms = io.sockets.adapter.rooms;
      let room = rooms.get(newUrl);
      console.log("room", room);
      callback({ success: 'Room was created', id: newUrl })
    }
    catch (err) {
      callback({ err });
    }

    socket.on("disconnect", () => {
      socket.to(newUrl).emit("user-disconnected", userId);
    });
  });

  socket.on("vue-join", function (roomName, joinedStreamType, callback) {
    try {
      console.log('vue-join');
      socket.join(roomName);
      let rooms = io.sockets.adapter.rooms;
      let room = rooms.get(roomName);
      console.log("room", room);
      callback({ success: 'Joined successfully' })
      // emit
      console.log('ready joinedStreamType', joinedStreamType);
      socket.to(roomName).emit("ready", userId, joinedStreamType); //Informs the other peer in the room.
    }
    catch (err) {
      callback({ err });
    }
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

  socket.on("candidate", function (candidate, userToReplyTo, streamCommunication) {
    console.log("candidate", candidate.candidate);
    // console.log(candidate);
    //Sends Candidate to the other peer in the room.
    socket.to(userToReplyTo).emit("candidate", candidate, userId, streamCommunication);
  });

  //Triggered when server gets an offer from a peer in the room.
  socket.on("offer", (offer, userToReplyTo, streamCommunication) => {
    console.log("offer");

    // x1
    socket.to(userToReplyTo).emit("offer", offer, userId, streamCommunication); //Sends Offer to the other peer in the room.
  });

  //Triggered when server gets an answer from a peer in the room.

  socket.on("answer", function (answer, userToReplyTo, streamCommunication) {
    console.log("answer");
    // x1
    socket.to(userToReplyTo).emit("answer", answer, userId, streamCommunication); //Sends Answer to the other peer in the room.
  });

  socket.on("force-disconnect", (callback) => {
    try {
      socket.disconnect();
      console.log('rooms', io.sockets.adapter.rooms);
      callback({ success: 'Disconnected' })
    } catch (err) {
      callback({ err })
    }
  });

  socket.on("name", (roomName, newName) => {
    socket.to(roomName).emit("name", userId, newName); //Informs the other peer in the room.
  });

  socket.on("hideVideo", roomName => {
    socket.to(roomName).emit("hideVideo", userId);
  })

  socket.on("showVideo", roomName => {
    socket.to(roomName).emit("showVideo", userId);
  })
});

// socket/socketHub.js

"use strict";

module.exports = function(server, session) {
  var io = require("socket.io")(server);

  io.use(function(socket, next) {
    session(socket.request, {}, next);
  });

  io.on("connection", function(socket) {
    
    var passport = socket.request.session.passport;
    //
    if(passport) {
      let _id = passport.user._id;
      socket.join(_id);
    }

    socket.on("message", function(data) {
      if (!data.target) {
        io.emit("message", data.message);
      }
      else {
        io.to(data.target).emit("message", data.message);
        if(passport) {
          io.to(passport.user._id).emit("message", data.message);
        } else {
          socket.emit("message", data.message);
        }
      }
    });
  });
};

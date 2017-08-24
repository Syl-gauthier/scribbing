// app.js
/* eslint no-console: "off" */

"use strict";

require("dotenv").config();

const express = require("express");
var session = require("express-session");
var passport = require("passport");
var morgan = require("morgan");
var cookieParser = require("cookie-parser");
const app = express();
var port = process.env.PORT || 3000;

//socket.io
var server = require("http").Server(app);
var io = require("socket.io")(server);

//unique db connection
const url = process.env.DB_CRED;
var MongoClient = require("mongodb").MongoClient;
var db = new Promise(function(resolve, reject) {
  MongoClient.connect(url, function(err, db) {
    if (err) {
      reject(err);
    }
    else {
      resolve(db);
    }
  });
});

//routers
var authRouter = require("./routes/auth.js")(db);
var listsRouter = require("./routes/lists.js")(db);
var searchRouter = require("./routes/search.js")(db);
var friendsRouter = require("./routes/friends.js")(db);
var messagesRouter = require("./routes/messages.js")(db);
var userRouter = require("./routes/user.js")(db);


app.use(morgan("tiny"));

app.use("/public", express.static("public", {maxAge: 3600000}));


app.set("view engine", "pug");

app.use(require("body-parser").urlencoded({ extended: true }));
app.use(cookieParser());

var expressSession = session({
  secret: "just another secret",
  resave: true,
  saveUninitialized: true,
  cookie: {maxAge: 1800000}
});

app.use(expressSession);

//passport init
app.use(passport.initialize());
app.use(passport.session());

app.get("/", function(req, res) {
  if (req.user) {
    res.redirect("/dashboard");
  }
  else {
    res.render("index");
  }
});

app.use("/auth", authRouter);

if(process.env.NODE === "dev") {
  app.use(function(req, res, next) {
    if (!req.user) {
      var ObjectId = require("mongodb").ObjectID;
      db.then(function(db) {
        db.collection("users").findOne({_id: ObjectId("599404da8ac66f4157b6607c")}, function(err, result) {
          req.user= result;
          next();
        });
      }).catch(function() {res.redirect("/err");});
    } else {next();}
  });
}

//after this, user must be logged in
app.use(function(req, res, next) {
  if(req.user) {
    next();
  }
  else {
    res.redirect("/");
  }
});

app.use("/list", listsRouter);
app.use("/search", searchRouter);
app.use("/friends", friendsRouter);
app.use("/messages", messagesRouter);
app.use("/user", userRouter);

app.get("/dashboard",
  function(req, res) {
    res.render("dashboard", {user: req.user});
  }
);

app.use(function(req, res) {
  res.status(404).render("404", {user: req.user});
});

server.listen(port, function() {
  console.log("\x1b[32m", "app listening on port", port, "\x1b[0m");
});


io.use(function(socket, next) {
  expressSession(socket.request, {}, next);
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

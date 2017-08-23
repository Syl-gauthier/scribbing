// app.js
/* eslint no-console: "off" */

'use strict';

require('dotenv').config();

const express = require('express');
var session = require('express-session');
var passport = require('passport');
var morgan = require('morgan');
var cookieParser = require('cookie-parser');
const app = express();
var port = process.env.PORT || 3000;

//socket.io
var server = require('http').Server(app);
var io = require('socket.io')(server);

//routers
var authRouter = require('./routes/auth.js');
var listsRouter = require('./routes/lists.js');
var searchRouter = require('./routes/search.js');
var friendsRouter = require('./routes/friends.js');
var messagesRouter = require('./routes/messages.js');

app.use(morgan('tiny'));

app.use('/public', express.static('public', {maxAge: 3600000}));


app.set('view engine', 'pug');

app.use(require('body-parser').urlencoded({ extended: true }));
app.use(cookieParser());

var expressSession = session({
  secret: 'just another secret',
  resave: true,
  saveUninitialized: true,
  cookie: {maxAge: 1800000}
});

app.use(expressSession);

//passport init
app.use(passport.initialize());
app.use(passport.session());

app.get('/', function(req, res) {
  if (req.user) {
    res.redirect('/dashboard');
  }
  else {
    res.render('index');
  }
});

app.use('/auth', authRouter);

if(process.env.NODE === 'dev') {
  app.use(function(req, res, next) {
    if (!req.user) {
      var MongoClient = require('mongodb').MongoClient;
      var ObjectId = require('mongodb').ObjectID;
      MongoClient.connect(process.env.DB_CRED, function(err, db) {
        if (err) console.log(err);
        else {
          db.collection('users').findOne({_id: ObjectId('599404da8ac66f4157b6607c')}, function(err, result) {
            req.user= result;
            console.log(req.user);
            next();
          });
        }
      });
    } else {next();}
  });
}

//after this, user must be logged in
app.use(function(req, res, next) {
  if(req.user) {
    next();
  }
  else {
    res.redirect('/');
  }
});

app.use('/list', listsRouter);
app.use('/search', searchRouter);
app.use('/friends', friendsRouter);
app.use('/messages', messagesRouter);



app.get('/dashboard',
  function(req, res) {
    res.render('dashboard', {user: req.user});
  }
);

app.use(function(req, res) {
  res.status(404).render('404', {user: req.user});
});

server.listen(port, function() {
  console.log('\x1b[32m', 'app listening on port', port, '\x1b[0m');
});


io.use(function(socket, next) {
  expressSession(socket.request, {}, next);
});

io.on('connection', function(socket) {
  
  console.log('connect');
  var passport = socket.request.session.passport;
  //
  if(passport) {
    let _id = passport.user.id._id;
    socket.join(_id);
  }

  socket.on('message', function(data) {
    console.log(data);
    if (!data.target) {
      console.log('no target');
      io.emit('message', data.message);
    }
    else {
      io.to(data.target).emit('message', data.message);
      if(passport) {
        io.to(passport.user.id._id).emit('message', data.message);
      } else {
        socket.emit('message', data.message);
      }
    }
  });
});

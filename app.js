/* eslint no-console: "off" */
'use strict';
require('dotenv').config();

const express = require('express');
var session = require('express-session');
var passport = require('passport');
var morgan = require('morgan');

const app = express();
var port = process.env.PORT || 3000;

//routers
var authRouter = require('./routes/auth.js');
var listsRouter = require('./routes/lists.js');
var searchRouter = require('./routes/search.js');
var friendsRouter = require('./routes/friends.js');


app.use(morgan('tiny'));

app.use('/public', express.static('public', {maxAge: 3600000}));


app.set('view engine', 'pug');

app.use(require('body-parser').urlencoded({ extended: true }));
app.use(require('cookie-parser')());

app.use(session({
  secret: 'just another secret',
  resave: true,
  saveUninitialized: true,
  cookie: {maxAge: 1800000}
}));

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



app.get('/dashboard',
  function(req, res) {
    res.render('dashboard', {user: req.user.id});
  }
);

app.use(function(req, res) {
  res.status(404).render('404', {user: req.user.id});
});

app.listen(port, function() {
  console.log('app listening on port', port);
});
/* eslint no-console: "off" */
'use strict';
require('dotenv').config();

const express = require('express');
var session = require('express-session');
var passport = require('passport');
var morgan = require('morgan');

const app = express();
var port = process.env.PORT || 3000;

app.use(morgan('tiny'));

app.use('/public', express.static('public'));


app.set('view engine', 'pug');

//routers
var authRouter = require('./routes/auth.js');
var listsRouter = require('./routes/lists.js');

app.use(require('body-parser').urlencoded({ extended: true }));
app.use(require('cookie-parser')());
//app.use(require('cookie-parser')());

app.use(session({
  secret: 'keyboard cat',
  resave: true,
  saveUninitialized: true,
  cookie: {maxAge: 1800000}
}));

app.use(passport.initialize());

app.use(passport.session());

app.use('/auth', authRouter);
app.use('/list', listsRouter);

app.get('/', function(req, res) {
  if (req.user) {
    res.redirect('/dashboard');
  }
  else {
    res.render('index');
  }
});

app.get('/dashboard',
  function(req, res) {
    if(req.user) {
      res.render('dashboard', req.user.id);
    }
    else {
      res.redirect('/');
    }
  }
);

/*app.use(function(req, res) {
  res.status(404).send('Sorry, can\'t find that  (404)');
});*/

app.listen(port, function() {
  console.log('app listening on port', port);
});
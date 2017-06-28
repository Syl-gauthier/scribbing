require('dotenv').config();

const express = require('express');
var session = require('express-session');
var passport = require('passport');

const app = express();
var port = process.env.PORT || 3000;

//routers
var authRouter = require('./routes/auth.js');

app.use(require('body-parser').urlencoded({ extended: true }));
app.use(require('cookie-parser')());
//app.use(require('cookie-parser')());

app.use(session({
  secret: 'keyboard cat',
  resave: true,
  saveUninitialized: true
}))

app.use(passport.initialize());

app.use(passport.session());

app.use('/auth', authRouter);

app.get('/', function(req, res, next) {
  var sess = req.session
  if (sess.views) {
    sess.views++;
    res.setHeader('Content-Type', 'text/html');
    res.write('<p>views: ' + sess.views + '</p>');
    res.write('<p>expires in: ' + (sess.cookie.maxAge / 1000) + 's</p>');
    //console.log(req.user.name)
    //res.write(req.user.name);
    res.end();
  } else {1
    sess.views = 1;
    res.end('welcome to the session demo. refresh!');
  }
})

app.listen(port, function() {
	console.log('app listening on port', port);
});
var express = require('express');
var router = express.Router();

var passport = require('passport');
var facebookStrategy = require('passport-facebook').Strategy;
var googleStrategy = require('passport-google-oauth20').Strategy;

var user = require('../lib/user.js')

//sessions
passport.serializeUser(function(user, cb) {
  return cb(null, (user));
});

passport.deserializeUser(function(user, done) {
  return done(null, user);
});

//facebook login
passport.use(new facebookStrategy({
    clientID: process.env.FACEBOOK_LOCAL_ID,
    clientSecret: process.env.FACEBOOK_LOCAL_SECRET,
    callbackURL: "http://localhost:3000/auth/facebook/callback"
  },
  function(accessToken, refreshToken, profile, cb) {
  	console.log('facebook');
   user.login('facebook', profile.id, function(err, userId) {
        return cb(err, {id: userId, name: profile.displayName});
    });
  }
));

router.get('/facebook',
  passport.authenticate('facebook'));

router.get('/facebook/callback',
  passport.authenticate('facebook', { failureRedirect: '/login' }),
  function(req, res) {
    // Successful authentication, redirect home.
    res.redirect('/');
});

//google login
passport.use(new googleStrategy({
    clientID: process.env.GOOGLE_LOCAL_ID,
    clientSecret: process.env.GOOGLE_LOCAL_SECRET,
    callbackURL: "http://localhost:3000/auth/google/callback"
  },
  function(accessToken, refreshToken, profile, cb) {
    user.login('google', profile.id, function(err, userId) {
        return cb(err, {id: userId, name: 'jean-jacques'});
    });
  }
));

router.get('/google',
  passport.authenticate('google', { scope: ['profile'] }));

router.get('/google/callback',
  	passport.authenticate('google', { failureRedirect: '/' }),
  		function(req, res) {
    // Successful authentication, redirect home.
    	res.redirect('/');
});


module.exports = router;


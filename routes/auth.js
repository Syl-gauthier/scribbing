'use strict';
var express = require('express');
var router = express.Router();

var passport = require('passport');
var facebookStrategy = require('passport-facebook').Strategy;
var googleStrategy = require('passport-google-oauth20').Strategy;
 
var user = require('../lib/user.js');

//sessions
passport.serializeUser(function(user, cb) {
  return cb(null, user);
});

passport.deserializeUser(function(user, done) {
  return done(null, user);
});


//facebook login
passport.use(new facebookStrategy({
  clientID: process.env.FACEBOOK_ID,
  clientSecret: process.env.FACEBOOK_SECRET,
  callbackURL: '/auth/facebook/callback',
  profileFields: ['id', 'displayName', 'photos', 'email']
},
function(accessToken, refreshToken, profile, cb) {
  user.login('facebook', profile, function(err, userId) {
    return cb(err, {id: userId, name: profile.displayName});
  });
}));

router.get('/facebook',
  passport.authenticate('facebook', {scope: ['email']}));

router.get('/facebook/callback',
  passport.authenticate('facebook', { failureRedirect: '/?failLog=true' }),
  function(req, res) {
    // Successful authentication, redirect home.
    res.redirect('/');
  }
);

//google login
passport.use(new googleStrategy({
  clientID: process.env.GOOGLE_ID,
  clientSecret: process.env.GOOGLE_SECRET,
  callbackURL: '/auth/google/callback'
},
function(accessToken, refreshToken, profile, cb) {
  user.login('google', profile, function(err, userId) {
    return cb(err, {id: userId, name: profile.displayName});
  });
}));

router.get('/google',
  passport.authenticate('google', { scope: ['profile', 'email'] }));

router.get('/google/callback',
  passport.authenticate('google', { failureRedirect: '/?failLog=true' }),
  function(req, res) {
  // Successful authentication, redirect home.
    res.redirect('/');
  }
);

router.get('/logout',
  function(req, res) {
    req.logout();
    res.redirect('/');
  }
);


module.exports = router;


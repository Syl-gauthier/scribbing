// routes/messages.js

'use strict';

var router = require('express').Router();

var MongoClient = require('mongodb').MongoClient;
var url = process.env.DB_CRED;

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

router.get('/', function(req, res) {
  res.render('discussion.pug', {user: req.user.id});
});

router.get('/:userId', function(req, res) {
  if(req.user.id.friends&&~req.user.id.friends.indexOf(req.params.userId)) {
    res.render('discussion.pug', {user: req.user.id, target: req.params.userId});
  } else {
    res.redirect('/');
  }
});

module.exports = router;

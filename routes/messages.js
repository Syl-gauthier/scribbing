'use strict';
var router = require('express').Router();

var MongoClient = require('mongodb').MongoClient;
var url = process.env.DB_LOCAL;

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

module.exports = router;

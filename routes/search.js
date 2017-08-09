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
  db.then(function(db) {
    db.collection('users').find({$text: {$search: req.query.query}}).toArray(function (err, result) {
      res.render('search', {user: req.user.id, result});
    }).catch(function() {
      res.redirect('/err');
    });
  });
});

module.exports = router;


//{$text: {$serach: req.params.query}}
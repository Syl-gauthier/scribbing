'use strict';
var router = require('express').Router();
var ObjectId = require('mongodb').ObjectID;

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

router.get('/add/:userId', function(req, res) {
  db.then(function(db) {
    
    Promise.all([ //save the friend request on the sender and the receiver profile (resp.: friendReq pendingFriendReq)
      new Promise(function(resolve, reject) {
        db.collection('users').updateOne({_id: ObjectId(req.user.id._id)}, {$addToSet: {friendReq: req.params.userId}}, function(err, result) {
          if(err) reject(err);
          req.user.id.friendReq ? req.user.id.friendReq.push(req.params.userId) : req.user.id.friendReq = [req.params.userId] ;
          resolve(result);
        });
      }),
      new Promise(function(resolve, reject) {
        db.collection('users').updateOne({_id: ObjectId(req.params.userId)}, {$addToSet: {pendingFriendReq: req.user.id._id}}, function(err, result) {
          if(err) reject(err);
          resolve(result);
        });
      })
    ]).then(function(results) {
      res.send('done');
    }).catch(function(err) {
      console.log(err);
      res.redirect('/err');
    });
  });
});

module.exports = router; 
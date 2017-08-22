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

router.get('/accept/:userId', function(req, res) {
  let received = req.user.id.friendReqReceived.findIndex(function(user) {
    return user.id === req.params.userId;
  });

  if (~received){

    db.then(function(db) {
      return new Promise(function (resolve, reject) {
        db.collection('users').findOne({_id: ObjectId(req.params.userId)}, {displayName: 1, friendReqSend: 1}, function(err, result) {
          if (err) reject(err);

          let send = result.friendReqSend.findIndex(function(user) {
            return user.id === req.user.id._id;
          });

          if(~send) {
            resolve({db, userAdded: result});
          } else reject('no-friend-req-send');

        });
      });
    }).then(function(val) {
      Promise.all([
        new Promise(function(resolve, reject) {
          val.db.collection('users').updateOne(
            {_id: ObjectId(req.user.id._id)}, 
            {
              $addToSet: {friends: {id: req.params.userId, name: val.userAdded.displayName}},
              $pull: {friendReqReceived: {id: req.params.userId}}
            }, 
            function(err, result) {
              if(err) reject(err);
              let newFriend = {id: req.params.userId, name: val.userAdded.displayName};
              req.user.id.friends ? req.user.id.friends.push(newFriend): req.user.id.friends = [newFriend];
              resolve(result);
            }
          );
        }),
        new Promise(function(resolve, reject) {
          val.db.collection('users').updateOne(
            {_id: ObjectId(req.params.userId)}, 
            {
              $addToSet: {friends: {id: req.user.id._id, name: req.user.id.displayName}},
              $pull: {friendReqSend: {id: req.user.id._id}}
            }, 
            function(err, result) {
              if(err) reject(err);
              resolve(result);
            }
          );
        })
      ]).then(
        function() {
          res.redirect('/');
        }, 
        function(err) {
          res.redirect('/err?err=' + err);
        }
      );

    });

  } else {
    res.redirect('/err?err=no-friend-req-received');
  }
});

router.get('/add/:userId', function(req, res) {
  db.then(function(db) {
    return new Promise(function (resolve, reject) {
      db.collection('users').findOne({_id: ObjectId(req.params.userId)}, {displayName: 1}, function(err, result) {
        if (err) reject(err);
        resolve({db, userAdded: result});
      });
    });
  }).then(function(val) {
    Promise.all([ //save the friend request on the sender and the receiver profile (resp.: friendReq pendingFriendReq)
      new Promise(function(resolve, reject) {

        val.db.collection('users').updateOne(
          {_id: ObjectId(req.user.id._id)}, 
          {$addToSet: 
            {friendReqSend: {id: req.params.userId, name: val.userAdded.displayName}}
          },
          function(err, result) {
            if(err) reject(err);
            let newFriend = {id: req.params.userId, name: val.userAdded.displayName};
            req.user.id.friendReqSend ? req.user.id.friendReqSend.push(newFriend) : req.user.id.friendReqSend = [newFriend] ; //update the store variable
            resolve(result);
          }
        );

      }),
      new Promise(function(resolve, reject) {

        val.db.collection('users').updateOne(
          {_id: ObjectId(req.params.userId)}, 
          {$addToSet: 
            {friendReqReceived: {id: req.user.id._id, name: req.user.id.displayName}}
          }, 
          function(err, result) {
            if(err) reject(err);
            resolve(result);
          }
        );

      })
    ]).then(function() {
      res.redirect('/');
    }).catch(function(err) {
      res.redirect('/err?err=' + err);
    });
  });
});


module.exports = router; 
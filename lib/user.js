'use strict';
var MongoClient = require('mongodb').MongoClient;
var ObjectId = require('mongodb').ObjectID;

// Connection URL 
var url = process.env.DB_LOCAL;
var user = (function() {

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

  var login = function(type, profile, cb) {

    db.then(function(db) {
      var collection = db.collection('users');
      switch (type) {
      case 'facebook':
        collection.findOne({facebookId: profile.id}, function (err, result) {
          if (err) throw err;
          if(result) {
            return cb(null, result);
          }
          else {
            var query = {facebookId: profile.id, displayName: profile.displayName, email: profile.emails[0].value};
            create(query, cb);
          }
        });
        break;

      case 'google':
        collection.findOne({googleId: profile.id}, function(err, result) {
          if (err) throw err;
          if(result) {
            return cb(null, result);
          }
          else {
            var query = {googleId: profile.id, displayName: profile.displayName, email: profile.emails[0].value};
            create(query, cb);
          }
        });
        break;
        
      default:
        user = collection.findOne({_id: profile.id}, function(err, result) {
          if (err) throw err;
          if (result) {
            return cb(null, result);
          }
          else {
            throw 'error: no user found';
          }
        });
        break;
      }

    });
  };

  function update(data, cb) {
    db.then(function(db) {
      var collection = db.collection('users');
      var query = {_id: ObjectId(data._id)};
      delete data._id;
      data.modification = new Date();
      data = {$set: data};
      collection.update(query, data, function(err, result) {
        cb(err, result);
      });
    });
  }

  function del(_id, cb) {
    db.then(function(db) {
      db.collection('users').deleteOne({_id: ObjectId(_id)}, function(err, result) {
        cb(err, result);
      });
    });
  }

  var create = function(query, cb) {
    db.then(function(db) {
      var collection = db.collection('users');
      collection.insert(query, function(err, result) {
        return cb(null, result.ops[0]);
      });
    });
  };

  return {login, update, del};
})();


module.exports = user;
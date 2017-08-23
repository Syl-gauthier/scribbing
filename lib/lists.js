// lib/lists.js

"use strict";

var ObjectId = require("mongodb").ObjectID;

var lists = function(db) {

  db.catch(function(err) {
    throw err;
  });

  var insert = function(data, cb) {
    db.then(function(db) {
      var collection = db.collection("lists");

      //insert the new words
      if (data.words) {
        var wordsPromises = data.words.map(function(word) {
          word.userId = data.userId;
          return new Promise(function(resolve, reject) {
            var words = require("./words.js");
            words.insert(word, function(err, result) {
              if (err) reject(err);
              delete result.modification; 
              delete result.creation;
              resolve(result);
            });
          }).catch(function(err) {
            throw err;
          });
        });

        var words = Promise.all(wordsPromises).catch(function(err) {
          throw err;
        });

        //the promise return an array including the new words ids
        words.then(function(words) {
          data.words = words;
          data.creation = new Date();
          data.modification = new Date();
          collection.insert(data, function(err, result) {
            cb(err, result.insertedIds[0]);
          });
        });
      }  
      else {
        data.creation = new Date();
        data.modification = new Date();
        collection.insert(data, function(err, result) {
          var list = {_id: result.insertedIds[0], name: data.name};
          db.collection("users").updateOne({_id: ObjectId(data.userId)}, {$addToSet: {listsIds: list}}, function (err/*, result*/) {
            cb(err, list);
          });
        });
      }

      
    });
  };

  var read = function(id, cb) {
    db.then(function(db) {
      var collection = db.collection("lists");
      try {
        id = new ObjectId(id);
      } catch (err) {
        return cb(err, null);
      }
      collection.findOne({_id: id}, function(err, result) {
        cb(err, result);
      });
    }); 
  };

  var update = function(data, cb) {
    db.then(function(db) {
      var collection = db.collection("lists");
      if (data.words) {
        //TODO
      }
      
      var query = {_id: ObjectId(data._id)};
      delete data._id;
      data.modification = new Date();
      data= {$set: data};
      collection.update(query, data, function(err, result) {
        cb(err, result);
      });
    });
  };

  var del = function(id, cb) {
    db.then(function(db) {
      var collection = db.collection("lists");
      id = ObjectId(id);
      collection.deleteOne({_id: id}, function(err, result) {
        db.collection("users").updateMany({}, {$pull: {listsIds: {_id: id}}}, function (err, result2) {
          cb(err, {listRes: result, userRes: result2});
        });
      });
    });
  };


  return {insert, read, update, del};
};


module.exports = lists;

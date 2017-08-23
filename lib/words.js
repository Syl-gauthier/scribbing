// lib/words.js

"use strict";

var ObjectId = require("mongodb").ObjectId;

var words = function(db) {

  var insert = function(data, cb) {
    db.then(function(db) {
      var collection = db.collection("words");
      data.creation = new Date();
      data.modification = new Date();
      collection.insert(data, function(err, result) {
        return cb(err, result.ops[0]);
      });
    });
  };

  var read = function(id, cb) {
    db.then(function(db) {
      var collection = db.collection("words");
      id = ObjectId(id);
      collection.findOne({_id: id}, function(err, result) {
        cb(err, result);
      });
    });
  };

  var update = function(data, cb) {
    db.then(function(db) {
      var collection = db.collection("words");
      var query = {_id: ObjectId(data._id)};
      delete data._id;
      data.modification = new Date();
      data = {$set: data};
      collection.update(query, data, function(err, result) {
        cb(err, result);
      });
    });
  };

  var del = function(id, cb) {
    db.then(function(db) {
      var collection = db.collection("words");
      id= ObjectId(id);
      collection.deleteOne({_id: id}, function(err, result) {
        cb(err, result);
      });
    });
  };

  return {insert, read, update, del};
};


module.exports = words;

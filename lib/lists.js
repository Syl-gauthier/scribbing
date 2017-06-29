var MongoClient = require('mongodb').MongoClient;

 
// Connection URL 
var url = 'mongodb://localhost:27017/scribbing';
var lists = (function() {

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

  db.catch(function(err) {
    throw err;
  });

  var insert = function(data, cb) {
    db.then(function(db) {
      var collection = db.collection('lists');
      var wordsPromises = data.words.map(function(word) {
        word.userId = data.userId;
        return new Promise(function(resolve, reject) {
          var words = require('./words.js');
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

      words.then(function(words) {
        data.words = words;
        data.creation = new Date();
        data.modification = new Date();
        collection.insert(data, function(err, result) {
          cb(err, result);
        });
      });
    });
  };

  var read = function(id, cb) {
    db.then(function(db) {
      var collection = db.collection('lists');
      collection.findOne({_id: id}, function(err, result) {
        cb(err, result);
      });
    }); 
  };

  var update = function(data, cb) {
    db.then(function(db) {
      var collection = db.collection('lists');
      if (data.words) {
        //TODO
      }
      
      var query = {_id: data._id};
      delete data._id;
      data.modification = new Date();
      collection.update(query, data, function(err, result) {
        cb(err, result);
      });
    });
  };

  var del = function(id, cb) {
    db.then(function(db) {
      var collection = db.collection('lists');
      collection.deleteOne({_id: id}, function(err, result) {
        cb(err, result);
      });
    });
  };


  return {insert, read, update, del};
})();


module.exports = lists;
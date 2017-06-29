var assert = require('assert');
var MongoClient = require('mongodb').MongoClient;


describe('words.js', function() {
  var words = require('./words.js');

  after(function(done) {
    MongoClient.connect('mongodb://localhost:27017/scribbing', function(err, db) {
      if(err) {
        done(err);
      }
      else {
        db.collection('words').deleteMany({test: true}, done);
      }
    });
  });

  describe('insert', function() {

    var insertData = {_id: '00', test: true, french: 'bientôt', english: 'soon', userId:'00'};

    it('should insert a new word in the database', function(done) {
      words.insert(insertData, function(err) {
        if(err) done(err);
        else {
          MongoClient.connect('mongodb://localhost:27017/scribbing', function(err, db) {
            if(err) {
              done(err);
            }
            else {
              db.collection('words').findOne({_id: '00'}, function(err, result) {
                assert.equal(result.french, 'bientôt');
                assert.equal(result.english, 'soon');
                assert.equal(result.userId, '00');
                done(err);
              });
            }
          });
        }
      });
      
    });
  });

  describe('read', function() {

    it('should return the word matching id', function(done) {
      MongoClient.connect('mongodb://localhost:27017/scribbing', function(err, db) {
        if (err) {
          done(err);
        }
        else {
          db.collection('words').insert({_id: '01', test: true, french: 'success'}, function(err) {
            if(err) done(err);
            words.read('01', function(err, result) {
              assert(result.french, 'success');
              done(err);
            });
          });
        }
      });
    });
  });

  describe('update', function() {
    var updateData = {_id: '02', french: 'incessament', english: 'soonish'};
    var insertData = {_id: '02', test: true, french: 'bientôt', english: 'soon', userId:'00'};

    it('should update the correct field of the word \'id\'', function(done) {
      MongoClient.connect('mongodb://localhost:27017/scribbing', function(err, db) {
        if(err) {
          done(err);
        }
        else {
          db.collection('words').insert(insertData, function(err) {
            if(err) {
              done(err);
            }
            else {
              words.update(updateData, function(err, result) {
                assert.equal(result.result.nModified, 1);
                assert.equal(result.result.ok, 1);
                done(err);
              });
            }
          });
        }
      });
    });

  });

  describe('del', function() {
    var insertData = {_id: '03', test: true};
    it('should delete the word \'id\'', function(done) {
      MongoClient.connect('mongodb://localhost:27017/scribbing', function(err, db) {
        if(err) {
          done(err);
        }
        else {
          db.collection('words').insert(insertData, function(err) {
            if(err) {
              done(err);
            }
            else {
              words.del('03', function(err, result) {
                assert.equal(result.deletedCount, 1);
                db.collection('words').findOne({_id: '03'}, function(err, result) {
                  assert(!result);
                  done(err);
                });
              });
            }
          });
        }
      });
    });
  });
});
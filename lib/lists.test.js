'use strict';
var MongoClient = require('mongodb').MongoClient;
var ObjectId = require('mongodb').ObjectID;
var assert = require('assert');

describe('list.js', function() {

  var lists = require('./lists.js');
  var db;
  before(function(done) {
    db = new Promise(function(resolve, reject) {
      MongoClient.connect(process.env.DB_LOCAL, function(err, db) {
        if (err) {
          reject(err);
        }
        else {
          resolve(db);
        }
      });
    });
    db.then(function() {
      done(null);
    }, function(err) {
      done(err);
    });
  });

  describe('insert', function() {
    var insertData = {_id: '00', test: true, languages: ['french', 'english'], words: [{test: true, french: 'insert1', english: 'insert1'}, {test: true, french: 'insert1', english: 'insert1'}], userId:'00'};

    it('should insert a new list in the database and its words', function(done) {
      lists.insert(insertData, function(err) {
        if(err) done(err);
        else {
          db.then(function(db) {
            if(err) {
              done(err);
            }
            else {
              db.collection('lists').findOne({_id: '00'}, function(err, result) {
                assert.equal(result.languages[0], 'french');
                assert(result.words);
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
    it('should return the list matching id', function(done) {
      lists.read('507f191e1111112222000101', function(err, result) {
        assert(result.name, 'test list 2');
        done(err);
      });
    });

  });

  describe('update', function() {
    var updateData = {_id: '507f191e1111112222000100', languages:['lang1', 'lang2']};

    it('should update the correct field of the list \'id\'', function(done) {
      lists.update(updateData, function(err, result) {
        assert.equal(result.result.nModified, 1);
        assert.equal(result.result.ok, 1);
        done(err);
      });
    });
  });

  describe('del', function() {
    it('should delete the list \'id\'', function(done) {

      lists.del('507f191e1111112222000100', function(err, result) {
        assert.equal(result.listRes.deletedCount, 1);
        if (err) return done(err);
        db.then(function(db) {
          db.collection('lists').findOne({_id: ObjectId('507f191e1111112222000100')}, function(err, result) {
            assert(!result);
            done(err);
          });
        });
      });
    });
  });
});
// lib/words.test.js

"use strict";

var assert = require("assert");
var MongoClient = require("mongodb").MongoClient;
var ObjectId = require("mongodb").ObjectID;

describe("words.js", function() {
  var words = require("./words.js");
  var db;
  before(function(done) {
    db = new Promise(function(resolve, reject) {
      MongoClient.connect(process.env.DB_CRED, function(err, db) {
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

  describe("insert", function() {

    var insertData = {_id: "00", test: true, french: "bientôt", english: "soon", userId:"00"};

    it("should insert a new word in the database", function(done) {
      words.insert(insertData, function(err) {
        if(err) done(err);
        else {
          db.then(function(db) {
            if(err) {
              done(err);
            }
            else {
              db.collection("words").findOne({_id: "00"}, function(err, result) {
                assert.equal(result.french, "bientôt");
                assert.equal(result.english, "soon");
                assert.equal(result.userId, "00");
                done(err);
              });
            }
          });
        }
      });
      
    });
  });

  describe("read", function() {

    it("should return the word matching id", function(done) {
      words.read("507f191e1111112222000201", function(err, result) {
        assert(result.lang1, "banane");
        done(err);
      });
    });
  });

  describe("update", function() {
    var updateData = {_id: "507f191e1111112222000200", languages:["lang1", "lang2"], lang1: "incessament", lang2: "soonish"};

    it("should update the correct field of the word 'id'", function(done) {
      words.update(updateData, function(err, result) {
        assert.equal(result.result.nModified, 1);
        assert.equal(result.result.ok, 1);
        done(err);
      });
    });

  });

  describe("del", function() {
    it("should delete the word 'id'", function(done) {

      words.del("507f191e1111112222000200", function(err, result) {
        assert.equal(result.deletedCount, 1);
        if (err) return done(err);
        db.then(function(db) {
          db.collection("words").findOne({_id: ObjectId("507f191e1111112222000200")}, function(err, result) {
            assert(!result);
            done(err);
          });
        });
      });
    });
  });
});

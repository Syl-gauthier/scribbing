// lib/user.test.js

"use strict";

var assert = require("assert");
var MongoClient = require("mongodb").MongoClient;
var ObjectId = require("mongodb").ObjectID;

describe("user.js", function() {
  var user = require("./user.js");
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

  describe("login",function() {
    it("should identifie the user that logged in if he already exist", function(done) {
      user.login("facebook", {id: "10000111122223333"}, function(err, result) {
        assert.equal(result.displayName, "Test user 1");
        done(err);
      });
    });
    it("should create the user that logged in if he don't exist", function(done) {
      var profile = {
        id: "300000111112222233333",
        displayName: "loginTest",
        emails: [{value: "some@test.email"}],
        test: true
      };
      user.login("google", profile, function(err, result) {
        var _id = ObjectId(result._id);
        db.then(function(db) {
          if(err) return done(err);
          db.collection("users").findOne({_id: _id}, function(err, result) {
            assert.equal(result.displayName, "loginTest");
            done(err);
          });
        });
      });
    });
  });

  describe("update",function() {
    var updateData = {_id: "507f191e1111112222000000", displayName: "updated test user"};

    it("should update the specified fields of an user", function(done) {
      user.update(updateData, function(err, result) {
        assert.equal(result.result.nModified, 1);
        assert.equal(result.result.ok, 1);
        done(err);
      });
    });
  });

  describe("updateLists",function() {
    it("should update the lists array by searching all of this users lists");
  });

  describe("updateWords",function() {
    it("should update the words array by searching the last 30 of this users words");
  });

  describe("del",function() {
    it("should delete the user and take care of its lists and words ", function(done) {
      var _id = "507f191e1111112222000000";
      user.del(_id, function(err) {
        if(err) return done(err);
        db.then(function(db) {
          db.collection("users").findOne({_id: ObjectId(_id)}, function(err, result) {
            assert(!result);
            done(err);
          });
        });
      });
    }); //TODO choose what should happend to the lists and words
  });
});

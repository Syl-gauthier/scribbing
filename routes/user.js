// routes/user.js

"use strict";

var express = require("express");
var router = express.Router();

var ObjectId = require("mongodb").ObjectID;



module.exports = function(db) {



  router.get("/:userId", function(req, res) {

    db.then(function(db) {
      db.collection("users").findOne({_id: ObjectId(req.params.userId)}, function(err, profile) {
        console.log(profile);
        res.render("profile.pug", {user: req.user, profile});
      });
    });

  });

  return router;
};

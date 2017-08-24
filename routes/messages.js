// routes/messages.js

"use strict";

var router = require("express").Router();

module.exports = function(db) {
  router.get("/", function(req, res) {
    res.render("discussion.pug", {user: req.user});
  });

  router.get("/:userId", function(req, res) {
    if(req.user.friends) {
      var index = req.user.friends.findIndex(function(user) {
        return user.id === req.params.userId;
      });
    }

    if(~index) {
      res.render("discussion.pug", {user: req.user, target: req.params.userId});
    } else {
      res.redirect("/");
    }
  });

  return router;

};

// routes/messages.js

"use strict";

var router = require("express").Router();

module.exports = function(db) {
  router.get("/", function(req, res) {
    res.render("discussion.pug", {user: req.user});
  });

  router.get("/:userId", function(req, res) {
    if(req.user.friends&&~req.user.friends.indexOf(req.params.userId)) {
      res.render("discussion.pug", {user: req.user, target: req.params.userId});
    } else {
      res.redirect("/");
    }
  });

  return router;

};

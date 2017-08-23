// routes/search.js

'use strict';

var router = require('express').Router();

var MongoClient = require('mongodb').MongoClient;
var url = process.env.DB_CRED;

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

router.get('/', function(req, res) {
  db.then(function(db) {
    db.collection('users').find({$text: {$search: req.query.query}}).toArray(function (err, result) {
      let data = result.map(function(match) {
        let filteredMatch = {id: match._id, name: match.displayName};
        if(arrayMatch(req.user, 'friends', match._id)) {
          filteredMatch.status = 'friend';
          return filteredMatch;
        } else if(arrayMatch(req.user, 'friendReqReceived', match._id)) {
          filteredMatch.status = 'received';
          return filteredMatch;
        } else if(arrayMatch(req.user, 'friendReqSend', match._id)) {
          filteredMatch.status = 'send';
          return filteredMatch;
        } else {
          return filteredMatch;
        }
      });
      res.render('search', {user: req.user, data});
    });
  }).catch(function() {
    res.redirect('/err');
  });
});

module.exports = router;

function arrayMatch(object, array, elt) {
  elt += '';
  if (object[array] && ~object[array].findIndex(function(user) {return elt === user.id;})) {
    return true;
  }
  return false;
}

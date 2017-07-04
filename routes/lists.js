'use strict';
var express = require('express');
var router = express.Router();
 
var lists = require('../lib/lists.js');

router.get('/', function(req, res) {
  if(req.user) {
    res.render('list', {list: {name: 'liste',languages: ['english', 'francais'], words:[{english: 'test', francais:'teste'}, {english: 'autre', francais: 'oui'}]}});
  }
  else {
    res.redirect('/');
  }
});
//5956099830e1cf70680f7db8
router.get('/:listId', function(req, res) {
  lists.read(req.params.listId, function(err, result) {
    if (err) {
      res.redirect('/');
    }
    else {
      res.render('list', {list: result});
    }
  });
});

module.exports = router;

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

router.post('/update', function(req, res) {
  var data = {_id: req.body.meta._id, name: req.body.meta.name, languages: req.body.languages, words: req.body.words};
  lists.update(data, function(err, result) {
    if(err){
      res.send('An error occured while saving\n' + result);
    }
    else {
      res.send(result);
    }
  });
});

router.get('/get/:listId', function(req, res) {
  lists.read(req.params.listId, function(err, result) {
    if(err) res.send('An error occured while fetching your list\n' + result);
    else {
      res.send(result);
    }
  });
});

//5956099830e1cf70680f7db8
router.get('/:listId', function(req, res) {
  lists.read(req.params.listId, function(err, result) {
    if (err) {
      res.redirect('/');
    }
    else {
      if(req.user) {
        res.render('list', {list: result, user: req.user.id});
      }
      else {
        res.redirect('/');
      }
    }
  });
});

router.get('/update/:listId', 
  function(req, res) {
    if(req.user) {
      res.render('test', {listId: req.params.listId, user: req.user.id});
    }
    else {
      res.redirect('/');
    }
  }
);

router.get('/new', 
  function(req,res) {
    res.render('newList');
  });



module.exports = router;

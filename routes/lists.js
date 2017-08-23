// routes/lists.js

'use strict';

var router = require('express').Router();
 
var lists = require('../lib/lists.js');

//TODO
/*router.get('/', function(req, res) {
  res.render('list', {list: {name: 'liste',languages: ['english', 'francais'], words:[{english: 'test', francais:'teste'}, {english: 'autre', francais: 'oui'}]}});
});*/

router.post('/new/submit',
  function(req, res) {
    var data = {};
    data.name = req.body.name;
    var languages = [req.body.language1, req.body.language2];
    data.languages = languages;
    data.userId = req.user.id._id;
    lists.insert(data, function(err, result) {
      if (err) {
        console.log(err);
        res.redirect('/err');
      }
      else {
        req.user.id.listsIds.push(result);
        res.redirect('/list/update/' + result._id);
      }
    });
  }
);

router.get('/new',
  function(req,res) {
    console.log('I\'ve been here');
    res.render('newList', {user: req.user.id});
  }
);

router.get('/training/:listId', 
  function(req, res) {
    res.render('listTraining', {listId: req.params.listId, user: req.user.id});
  }
);

router.get('/get/:listId', function(req, res) {
  lists.read(req.params.listId, function(err, result) {
    if(err) res.send('An error occured while fetching your list\n' + result);
    else {
      res.send(result);
    }
  });
});

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

//any request beyond this point is reserved to the list owner
router.use(function(req, res, next) {
  req.listOwnerCheck = function(listId, cb) {
    lists.read(listId, function(err, result) {
      if (result.userId == req.user.id._id) {
        cb();
      }
      else {
        res.redirect('/err');
      }
    });
  };
  next();
});

//reserved to list owner
router.post('/update', function(req, res) {
  var data = {_id: req.body.meta._id, name: req.body.meta.name, languages: req.body.languages, words: req.body.words};
  req.listOwnerCheck(req.body.meta._id, function() {
    lists.update(data, function(err, result) {
      if(err){
        res.send('An error occured while saving\n' + result);
      }
      else {
        res.send(result);
      }
    });
  });
});


//reserved to list owner
router.get('/update/:listId', 
  function(req, res) {
    req.listOwnerCheck(req.params.listId, function() {
      res.render('listEdit', {listId: req.params.listId, user: req.user.id});
    });
  }
);

//reserved to list owner
router.get('/del/:listId', function(req, res) {
  req.listOwnerCheck(req.params.listId, function() {
    lists.del(req.params.listId, function(err) {
      if (err) {
        res.redirect('/err');
      }
      else {
        req.user.id.listsIds = req.user.id.listsIds.filter(function(list) {
          if (list._id == req.params.listId) return false;
          return true;
        });
        res.redirect('/');
      }
    });
  }); 
});

module.exports = router;

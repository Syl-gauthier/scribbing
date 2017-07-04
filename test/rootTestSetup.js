
var mongo = require('mongodb');
require('dotenv').config();

before('setting database', function(done) {
  this.timeout(10000);
  resetData(function() {
    setData(done);
  });
});

after ('resetting database', function(done) {
  resetData(done);
});

function setData(done) {
  var now = new Date();

  //setup database
  var testUsers = [{
    _id: mongo.ObjectID('507f191e1111112222000000'),
    facebookId: '10000111122223333',
    googleId: '100000111112222233333',
    displayName: 'Test user 1',
    email: 'testuser1@test.test',
    lists: [],
    words: [],
    modification: now,
    lastlog: now,
    test: true
  },
  {
    _id: mongo.ObjectID('507f191e1111112222000001'),
    facebookId: '20000111122223333',
    googleId: '200000111112222233333',
    displayName: 'Test user 2',
    email: 'testuser2@test.test',
    lists: [{
      _id: '507f191e1111112222000100',
      name: 'test list 1'
    },{
      _id: '507f191e1111112222000101',
      name: 'test list 2'
    }],
    words: [{
      _id: '507f191e1111112222000200',
      string: 'testos / testus'
    },{
      _id: '507f191e1111112222000201',
      string: 'banane / banana'
    }],
    modification: now,
    lastlog: now,
    test: true
  }];

  var testLists = [{
    _id: mongo.ObjectID('507f191e1111112222000100'),
    name: 'test list 1',
    languages: [],
    words: [],
    modification: now,
    test: true
  },{
    _id: mongo.ObjectID('507f191e1111112222000101'),
    name: 'test list 2',
    languages: ['lang1', 'lang2'],
    words: [{
      _id: '507f191e1111112222000200',
      lang1: 'testos',
      lang2: 'testus',
    }, {
      _id: '507f191e1111112222000201',
      lang1: '', 
      lang2: ''
    }],
    modification: now,
    test: true
  }];

  var testWords = [{
    _id: mongo.ObjectID('507f191e1111112222000200'),
    userId: '507f191e1111112222000001',
    languages: ['lang1', 'lang2'],
    lang1: 'testos',
    lang2: 'testus',
    modification: now,
    test: true
  },
  {
    _id: mongo.ObjectID('507f191e1111112222000201'),
    userId: '507f191e1111112222000001',
    languages: ['lang1', 'lang2'],
    lang1: 'banane',
    lang2: 'banana',
    modification: now,
    test: true
  }];


  mongo.MongoClient.connect(process.env.DB_LOCAL, function(err, db) {
    if (err) {done(err);}
    else {
      db.collection('users').insertMany(testUsers, function(err) {
        if (err) done(err);
        db.collection('lists').insertMany(testLists, function(err) {
          if (err) done(err);
          db.collection('words').insertMany(testWords, function(err) {
            done(err);
          });
        });
      });
    }
  });
}

function resetData(done) {
  mongo.MongoClient.connect(process.env.DB_LOCAL, function(err, db) {
    if (err) {done(err);}
    else {
      db.collection('users').deleteMany({test: true}, function(err) {
        if (err) done(err);
        db.collection('lists').deleteMany({test: true}, function(err) {
          if (err) done(err);
          db.collection('words').deleteMany({test: true}, function(err) {
            done(err);
          });
        });
      });
    }
  });
}
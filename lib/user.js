var MongoClient = require('mongodb').MongoClient
  , assert = require('assert');
 
// Connection URL 
var url = 'mongodb://localhost:27017/scribbing';
var user = (function() {

	var login = function(type, id, cb) {

		MongoClient.connect(url, function(err, db) {
			
			var collection = db.collection('users');
			switch (type) {

				case 'facebook':
					collection.findOne({facebookId: id}, function (err, result) {
						if (err) throw err;
						if(result) {
							return cb(null, result._id);
						}
						else {
							collection.insert({facebookId: id}, function(err, result) {
								return cb(null, result._id);
							});
						}
					});
					break;

				case 'google':
					collection.findOne({googleId: id}, function(err, result) {
						if (err) throw err;
						if(result) {
							return cb(null, result._id);
						}
						else {
							collection.insert({googleId: id}, function(err, result) {
								return cb(null, result._id);
							});
						}
					});
					break;
					
				default:
					user = collection.findOne({_id: id}, function(err, result) {
						if (err) throw err;
						if (result) {
							return cb(null, result);
						}
						else {
							throw 'error: no user found';
						}
					});
					break;
			}

		});
	}

	return {login}
})();


module.exports = user;
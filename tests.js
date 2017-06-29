var lists = require('./lib/lists.js');

var data = {userId: 1234, words: [{english: 'one', francais: 'un'},{english: 'two', francais: 'deux'},{english: 'tree', francais: 'trois'}]};

lists.insert(data, function(err, result) {
	if (err) throw err;
	lists.read(result.ops[0]._id, function(err, result) {
		lists.del(result._id, function(err, result) {
			process.exit();
		});
	});
});
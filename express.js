var express = require('express')
  , mongoskin = require('mongoskin')
  , bodyParser = require('body-parser');
  
var app = express();

app.use(bodyParser());

var db = mongoskin.db('mongodb://heroku_app36519756:2rlv29m6qvscth659opka2g86e@ds063809.mongolab.com:63809/heroku_app36519756', {safe: false});

app.use(require("morgan")('dev'));

app.param('collectionName', function(req, res, next, collectionName) {
	req.collection = db.collection(collectionName);
	return next();
});

app.get('/', function(req, res) {
	res.send('please select a collection, e.g., /collections/messages');
});

app.all('*', function(req, res, next) {
	res.header("Access-Control-Allow-Origin", "*");
	res.header("Access-Control-Allow-Headers", "X-Requested-With");
	res.header("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS");
	next();
});

app.get('/collections/:collectionName', function(req, res, next) {
	req.collection.find({}, {
		limit: 10,
		sort: [
			['_id', -1]
		]
	}).toArray(function(e, results) {
		if(e)
			return next(e);
		res.send(results);
	});
});

app.post('/collections/:collectionName', function(req, res, next) {
	req.collection.insert(req.body, {}, function(e, results) {
		if (e)
			return next(e);
		res.send(results);
	});
});

app.get('/collections/:collectionName/:id', function(req, res, next) {
	req.collection.findById(req.params.id, function(e, result) {
		if(e)
			return next(e);
		res.jsonp(result);
	});
});

app.put('/collections/:collectionName/:id', function(req, res, next) {
	req.collection.updateById(req.params.id, {$set: req.body}, {safe: true, multi: false}, function(e, result) {
		if(e)
			return next(e);
		res.send( result===1 ? {msg: 'success'} : {msg: 'error'} );
	});
});

app.del('/collections/:collectionName/:id', function(req, res, next) {
	req.collection.remove({
		_id: req.collection.id(req.params.id)
	}, function(e, result) {
		if(e)
			return next(e);
		res.send( result===1 ? {msg: 'success'} : {msg: 'error'} );
	});
});

app.listen(3000);

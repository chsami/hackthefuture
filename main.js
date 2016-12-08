var express = require('express');
var fs = require('fs');
var bodyParser = require('body-parser');
var ejs = require('ejs');
var request = require('request');
var http = require('http');
const app = express();
var mongodb = require('mongodb'); 

//We need to work with "MongoClient" interface in order to connect to a mongodb server.
var MongoClient = mongodb.MongoClient;

const url = 'mongodb://localhost:27017';
const HOST = 'localhost';

//server stuff
/*var server = http.createServer(app);
var io = require("socket.io").listen(server);*/

const SERVER_PORT = 43595;

"use strict";


MongoClient.connect(url, function (err, db) {
  if (err) {
    console.log('Unable to connect to the mongoDB server. Error:', err);
  } else {
	  console.log("connected");
  }
});

///////////SERVER STUFF///////////////////////////////////

/*io.sockets.on('connection', function (socket) {
	request('http://api.rsbuddy.com/grandExchange?a=guidePrice&i=2434&i=4151', function (error, response, body) {
		if (!error && response.statusCode == 200) {
			var json = JSON.parse(body);
			var first = json[Object.keys(json)[1]];
			io.sockets.emit('send2client', first['overall']);
		}
	});
	socket.on('disconnect', function (data) {
		console.log("disconnected.");
	});

	socket.on('send2server', function (data) {
		console.log(data);
		io.sockets.emit('send2client', 'Hello from the server');
	});
});*/

app.all('*', function (req, res, next) {
	res.header("Access-Control-Allow-Origin", "*");
	res.header("Access-Control-Allow-Headers", "X-Requested-With");
	next();
});

////////////////////////////////////////////////////////////


app.use((request, response, next) => {
	//console.log(request.headers)
	response.header('Access-Control-Allow-Origin', '*');
	response.header('Access-Control-Allow-Methods', 'GET,PUT,POST,DELETE');
	response.header('Access-Control-Allow-Headers', 'Content-Type');
	next();
});


/*Middleware*/
app.use((request, response, next) => {
	request.chance = Math.random();
	next();
});

app.get('/', (req, res) => {
	/*request('https://roguerovers-api-develop.azurewebsites.net/api/channel', function (error, response, body) {
		if (!error && response.statusCode == 200) {
			var robotJson = JSON.parse(body);
			//console.log(json[0]);
			for (var i = 0; i < robotJson.length; i++) {
				request('https://roguerovers-api-develop.azurewebsites.net/api/channel/' + robotJson[i], function (error, response, body) {
					if (!error && response.statusCode == 200) {
						var robotDetailJson = JSON.parse(body);
						
					}
				});
			}
			//var first = json[Object.keys(json)[1]];
			//console.log(first['overall']);
			//req.chance = first['overall'];
			//console.log(json);
			
			/*var first = json[Object.keys(json)[1]];
			console.log(first['overall']);
			req.chance = first['overall'];
		}
	});*/
	
	fs.readFile('cupid/index.html', 'utf-8', function (err, content) {
		if (err) {
			response.end('error occurred');
			return;
		}
		var renderedHtml = ejs.render(content, {
				
		}); //get redered HTML code
		res.end(renderedHtml);
	});
});

//server.listen(port);

app.listen(SERVER_PORT, (err) => {
  if (err) {
    return console.log('something bad happened', err)
  }

  console.log(`server is listening on ${SERVER_PORT}`)
})

app.use(express.static('public'))

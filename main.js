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

const url = 'mongodb://localhost:27017/Mars';
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

var urlChannels = "http://roguerovers-api-develop.azurewebsites.net/api/channel";
var urlRovers;
var ChannelIDs = [];
var channelID; 

request({url: urlChannels, json: true}, function (error, response, body) {

    if (!error && response.statusCode === 200) {
        ChannelIDs = body;
        for (_key in ChannelIDs) {
        	let key = _key;
			if(!ChannelIDs.hasOwnProperty(key)) continue;

			var urlRovers= urlChannels+"/" + ChannelIDs[key];

			request({url: urlRovers, json: true}, function (error, response, body) {
			
			    if (!error && response.statusCode === 200) {
			        console.log(body) // Print the json response

			        
					MongoClient.connect(url, function (err, db) {

					  if (err) {
					    console.log('Unable to connect to the mongoDB server. Error:', err);
					  } else {
					  	var collectionRover = db.collection('Rover');

							collectionRover.insert({
								Name: body.name,
								Position: body.position,
								Direction: body.direction,
								Speed: body.speed,
								ChannelID: ChannelIDs[key],
								Fav: false
							});	
					  

					  }
					});
			    }
			});


		}

    }
    
});



function UpdateRovers(){
	for (key in ChannelIDs) {
		
		if(!ChannelIDs.hasOwnProperty(key)) continue;

		var urlRover= urlChannels+"/" + ChannelIDs[key];

		request({url: urlRover, json: true}, function (error, response, body) {
		    if (!error && response.statusCode === 200) {
		        Rovers = body;
		        UpdateRoverPos(Rovers);

		        TempIndb(body);
		    }
		});
	}
	setTimeout(UpdateRovers,1000);


}



function UpdateRoverPos(Rover){
	MongoClient.connect(url, function (err, db) {
	  if (err) {
	    console.log('Unable to connect to the mongoDB server. Error:', err);
	  } else {

		var collectionRover = db.collection('Rover');
		collectionRover.update({Name: Rover.name},{$set:{Position: Rover.position}});	
	  }
	});
}

function TempIndb(Rover){
	
	MongoClient.connect(url, function (err, db) {
	  if (err) {
	    console.log('Unable to connect to the mongoDB server. Error:', err);
	  } else {
		var collectionRover = db.collection('Rover');
		collectionRover.findOne({Name : Rover.name}, function(err, result){
			if (err) {
				console.log("error opvragen Rover");
			}else{
				if (result !== null) {


				if (result.Position.x !== Rover.position.x && result.Position.y !== Rover.position.y ){
					var urlTemp = urlChannels + "/" +result.ChannelID + "/sensor/t1"
					request({url: urlTemp, json: true}, function (error, response, body) {

					    if (!error && response.statusCode === 200) {
					        
						    if(response!==""){
								TempInDB(Rover, body);
							}
					        
					    }
					});
					var urlwater = urlChannels + "/" +result.ChannelID + "/sensor/w1"
					request({url: urlwater, json: true}, function (error, response, body) {
						
					    if (!error && response.statusCode === 200) {
					        
						    if(response!==""){
								WaterInDB(Rover, body);
							}
					        
					    }
					});
				}
			}
			}
			
		});	

	  }
	});
}

function TempInDB(Rover, temp){
	console.log("temp detected " + temp);
	MongoClient.connect(url, function (err, db) {
	  if (err) {
	    console.log('Unable to connect to the mongoDB server. Error:', err);
	  } else {
	  	var collectionTemp = db.collection('Temp');
		collectionTemp.insert({
			RoverID: Rover.name,
			Pos: Rover.position,
			Temp: temp
		});	
	  }

	});
}
function WaterInDB(Rover, water){
	console.log("waterdetected " + water);
	MongoClient.connect(url, function (err, db) {
	  if (err) {
	    console.log('Unable to connect to the mongoDB server. Error:', err);
	  } else {
	  	var collectionWater = db.collection('Water');
		collectionWater.insert({
			RoverID: Rover.name,
			Pos: Rover.position,
			Water: water
		});	
	  }

	});
}


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


UpdateRovers();
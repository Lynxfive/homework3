var app = require('http').createServer(handler);
var io = require('socket.io')(app);
var fs = require('fs');

var PORT = process.env.PORT || process.env.NODE_PORT || 3000;

app.listen(PORT);

var square = {
    x: 0,
    y: 0,
    height: 100,
    width: 100,
	color: "red"
};

var player = {
		number: 0,
		score: 0
};

var numUsers = 0;

var users = {};
var squares = [];

function handler (req, res) {

  fs.readFile(__dirname + '/../client/index.html', function (err, data) {
    if (err) {
      throw err;
    }

    res.writeHead(200);
    res.end(data);
  });
}

io.on('connection', function (socket) {
	
	onJoined(socket);
	onDisconnect(socket);
    onScoreUpdate(socket);
  
  socket.on('returnUsers', function(data) {
	socket.emit('updatedUsers', square);
  });
  
  socket.on('updateSquares', function(data) {
	squares.splice(data, 1);
	io.sockets.in('room1').emit('updateSquares', squares);
  });

  socket.on('draw', function(data) {
    if(squares.length == 0){
		squares.push(data);
	}	
	io.sockets.in('room1').emit('updateSquares', squares);

  });

});

var onScoreUpdate = function(socket) {
	socket.on('updateScore', function(data) {
		socket.name = data.name;
		users[socket.name] = {name: data.name, score: data.score};	
		io.sockets.in('room1').emit('updateScore', users);
		io.sockets.in('room1').emit('updateChat', {name: data.name, score: data.score});
	});
};

var onJoined = function(socket) {
	socket.on("join", function(data) {
		socket.name = data.name;
		users[socket.name] = {name: data.name, score: data.score};		
		socket.join('room1');
		io.sockets.in('room1').emit('updateUsers', {users: users, squares: squares});

	});
  };
  
var onDisconnect = function(socket) {
	socket.on('disconnect', function(data) {
		var user = socket.name;
		io.sockets.in('room1').emit('removeUser', user);
		socket.leave('room1');
		delete users[socket.name];
	});
};
  

console.log("listening on port " + PORT);
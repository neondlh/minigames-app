var express = require('express');
var app = express();
var serv = require('http').Server(app);
var io = require('socket.io')(serv,{});

var Player = require('./server/js/player.js');
var SOCKET_LIST = {};
var playerList = {};
var initPack = {player:[]};
var removePack = {player:[]};

var startGame = false;


app.get('/', function( req, res) {
  res.sendFile(__dirname + '/client/index.html');
});
app.use('/client', express.static(__dirname + '/client'))

serv.listen(process.env.PORT || 2000);
console.log("Server started :3");

io.sockets.on('connection', function(socket){
  socket.id = Math.random();
  SOCKET_LIST[socket.id] = socket;

  socket.on('disconnect', function(){
    delete SOCKET_LIST[socket.id];
    delete playerList[socket.id];
    removePack.player.push(socket.id);
  });

  socket.on('login',function(data){
    console.log(data.userName);
      if(data){
        var player = Player(socket.id, data.userName, playerList, initPack);
        player.onConnect(socket);
        socket.emit('init',{
            player:Player.getAllInitPack()
        })
        socket.emit('loginResponse',{success:true});
      } else {
        socket.emit('loginResponse',{success:false});
      }
  });

  socket.on('startGame', function(data) {
    if(!data.gameStart){
      startGame = true;
      console.log("Emit startGameResponse: " + startGame);
      io.sockets.emit('startGameResponse',{startGame:startGame});
    }
  })

});

Player.update = function() {
  var pack = [];
  for(var i in playerList){
    var player = playerList[i];
    pack.push(player.getUpdatePack());
  }
  return pack;
}

Player.getAllInitPack = function(){
    var players = [];
    for(var i in Player.list)
        players.push(Player.list[i].getInitPack());
    return players;
}

setInterval(function(){
  var pack = {
		player:Player.update()
	}
	for(var i in SOCKET_LIST){
		var socket = SOCKET_LIST[i];
    socket.emit('init',pack);
    socket.emit('update',pack);
    socket.emit('remove', removePack);
	}
  initPack.player = [];
	removePack.player = [];
},1000/25);

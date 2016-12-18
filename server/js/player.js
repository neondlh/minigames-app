var Entity = require('./entity.js');

module.exports = function (id, userName, playerList, initPack){
  var self = Entity();
  self.id = id;
  self.userName = userName;
  self.score = 0;
  self.playerList = playerList;
  self.initPack = initPack;

  self.onConnect = function(socket){
    socket.on('addScore', function(data){
      self.score += data.score;
    });
  }

  playerList[self.id] = self;

  self.getInitPack = function(){
    return {
      id:self.id,
      userName: self.userName,
      score: self.score,
    };
  }
  self.getUpdatePack = function(){
    return {
      id:self.id,
      userName: self.userName,
      score: self.score,
    };
  }

  initPack.player.push(self.getInitPack());
  return self;
}

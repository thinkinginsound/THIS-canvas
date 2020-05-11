const MobileDetect = require('mobile-detect');

function initSocket(){
  io.use(sharedsession(session, {
      autoSave:true
  }));
  io.on('connection', async function(socket){
    let sessionExists = await dbHandler.checkExistsSession(socket.handshake.sessionID);
    let groupid = -1;
    let userindex = -1;
    let md;
    let username = "";
    if(!sessionExists){
      md = new MobileDetect(socket.handshake.headers['user-agent']).mobile()!=null;
      socket.handshake.session.md = md;
      socket.handshake.session.sessionstarted = Date.now();
      socket.handshake.session.save();
      await generateGroupID();
      if(verbose)logger.http(`user connected with id: ${socket.handshake.sessionID.slice(0,8)}... And type: ${md?'mobile':"browser"}`);
      setTimeout(()=>{
        logger.http("sessionexpired", {sessionID:socket.handshake.sessionID})
        socket.emit("sessionexpired", socket.handshake.sessionID);
        sessionExists = false;
        dbHandler.disableSession(socket.handshake.sessionID);
        players[groupid][userindex].sessionID = undefined;
        players[groupid][userindex].npcState = true;
        players[groupid][userindex].makeUserName();
        socket.broadcast.emit('updateUsernames', [userindex,players[groupid][userindex].userName]);
        groupid = -1;
        userindex = -1;
        socket.handshake.session.groupid = -1;
        socket.handshake.session.userindex = -1;
        socket.handshake.session.save();
      }, global.sessionduration);
    } else {
      groupid = socket.handshake.session.groupid
      userindex = socket.handshake.session.userindex
      md = socket.handshake.session.md
      username = players[groupid][userindex].userName;
      dbHandler.updateSession(socket.handshake.sessionID);
      if(verbose)logger.http(`user reconnected with id: ${socket.handshake.sessionID.slice(0,8)}...`);
    }

    socket.on('ready', (data, fn) => {
      fn({
        sessionkey: socket.handshake.sessionID,
        groupid:groupid,
        userindex:userindex,
        maxgroups:maxgroups,
        maxusers:maxusers,
        canvaswidth:global.npcCanvasWidth,
        canvasheight:global.npcCanvasHeight,
        sessionstarted:socket.handshake.session.sessionstarted,
        sessionduration:global.sessionduration,
        clockspeed:global.clockspeed,
        username:username,
        allUsernames:global.userNames
      })
    })

    socket.on('drawpixel', (data) => {
      if(groupid == -1 || userindex == -1){
        return;
      }
      global.herdingQueue[groupid][global.frameamount-1][userindex] = data.deg;
      dbHandler.updateSession(socket.handshake.sessionID);
      data.groupid = groupid;
      dbHandler.insertUserdata(socket.handshake.sessionID, data);
      socket.broadcast.emit('drawpixel', data);
      players[groupid][userindex].setPosition(data.mouseX, data.mouseY);
      if(socket.handshake.sessionID in global.herdupdate){
        groupid = global.herdupdate[socket.handshake.sessionID].groupid
        userindex = global.herdupdate[socket.handshake.sessionID].userindex
        socket.handshake.session.groupid = groupid;
        socket.handshake.session.userindex = userindex;
        socket.handshake.session.save();
      }
    });

    socket.on('disconnect', function(){
      if(verbose)logger.http(`user disconnected with id: ${socket.handshake.sessionID.slice(0,8)}...`);
    });

    socket.on('selfReflection', (data) => {
      dbHandler.updateSession(socket.handshake.sessionID, {
        selfreflection:data
      })
    });

    async function generateGroupID(){
      let firstEmpty = getFirstEmpty()
      groupid = firstEmpty[0]
      userindex = firstEmpty[1]
      if(userindex < 0 || userindex >= maxusers){
        groupid = -1;
        userindex = -1;
        socket.emit("sessionrevoked",socket.handshake.sessionID);
        // TODO: Send error message to client
        return false;
      }

      players[groupid][userindex].sessionID = socket.handshake.sessionID
      players[groupid][userindex].npcState = false;
      players[groupid][userindex].makeUserName()
      username = players[groupid][userindex].userName;
      socket.broadcast.emit('updateUsernames', {group:groupid,index:userindex,name:username});

      dbHandler.insertSession(socket.handshake.sessionID, groupid, md);

      // Save session specific data
      socket.handshake.session.groupid = groupid;
      socket.handshake.session.userindex = userindex;
      socket.handshake.session.save();
    }
  });

}
function getFirstEmpty(){
  let groupID = -1;
  let userID = -1;
  let groupsSize = new Array(4).fill(0);
  for(let groupIndex in players){
    for(let npcIndex in players[groupIndex]){
      if(!players[groupIndex][npcIndex].npcState)groupsSize[groupIndex]++
    }
  }
  groupID = groupsSize.indexOf(Math.min(...groupsSize));

  for(let npcIndex in players[groupID]){
    if(players[groupID][npcIndex].npcState){
      userID = npcIndex;
      break;
    }
  }
  // console.log("getFirstEmpty", groupID, userID);
  return [groupID, userID];
}
module.exports = {
  initSocket:initSocket
}

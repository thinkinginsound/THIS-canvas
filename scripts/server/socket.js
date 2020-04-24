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
        users[groupid][userindex] = "undefined";
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
        clockspeed:global.clockspeed
      })
    })

    socket.on('drawpixel', (data) => {
      if(groupid == -1 || userindex == -1){
        return;
      }
      dbHandler.updateSession(socket.handshake.sessionID);
      data.groupid = groupid;
      dbHandler.insertUserdata(socket.handshake.sessionID, data);
      socket.broadcast.emit('drawpixel', data);
      npcs[groupid][userindex].setPosition(data.mouseX, data.mouseY);
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
      let groups = await dbHandler.getSessionGroups();
      let groupsSize = groups.map(x => x.length);
      groupid = groupsSize.indexOf(Math.min(...groupsSize));
      userindex = users[groupid].indexOf("undefined");
      if(userindex < 0 || userindex >= maxusers){
        groupid = -1;
        userindex = -1;
        socket.emit("sessionrevoked",socket.handshake.sessionID);
        // TODO: Send error message to client
        return false;
      }

      users[groupid][userindex] = socket.handshake.sessionID;
      dbHandler.insertSession(socket.handshake.sessionID, groupid, md);

      // Save session specific data
      socket.handshake.session.groupid = groupid;
      socket.handshake.session.userindex = userindex;
      socket.handshake.session.save();
    }
  });

}

module.exports = {
  initSocket:initSocket
}

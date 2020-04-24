// Arm users every second and write last behaviour into db
function initTimer(){
    let clockCounter = dbHandler.getHighestClock()+1;
    setInterval(async () => {
    io.sockets.emit("clock",clockCounter);
    logger.info("clock", {index:clockCounter})

    // NPC
    for(let groupIndex in users){
        for(let userIndex in users[groupIndex]){
        if(users[groupIndex][userIndex] == "undefined"){
            let prevX = players[groupIndex][userIndex].xPos;
            let prevY = players[groupIndex][userIndex].yPos;
            players[groupIndex][userIndex].move(players[groupIndex]);
            let sessionKey = `npc_${groupIndex}_${userIndex}`
            let newX = players[groupIndex][userIndex].xPos;
            let newY = players[groupIndex][userIndex].yPos;
            let distance = tools.pointDist(prevX, prevY, newX, newY)
            var rad = Math.atan2(newY - prevY, prevX - newX);
            var deg = rad * (180 / Math.PI);
            let sendable = {
            sessionkey: sessionKey,
            mouseX: newX,
            mouseY: newY,
            degrees:deg,
            distance:distance,
            groupid: groupIndex,
            clock: clockCounter
            }
            io.sockets.emit("drawpixel",sendable);
            dbHandler.insertUserdata(sessionKey, sendable);
        }
        }
    }
    if(clockCounter%1==0){
        let clockOffset = clockCounter-global.frameamount + 1;
        let userdata = dbHandler.getUserdataByClock(clockOffset);
        let AIInput = [];
        for(let i = 0; i < global.maxgroups; i++){
        AIInput[i] = tools.createArray(global.frameamount, global.maxusers,-1);
        }
        for(let itm of userdata){
        let groupindex = parseInt(itm.groupid)
        let userindex = (itm.sessionkey.startsWith("npc_"))?
            parseInt(itm.sessionkey.split('_')[2]):
            parseInt(users[groupindex].indexOf(itm.sessionkey));

        let clockindex = parseInt((itm.clock - clockOffset));
        if(itm.distance == 0)itm.degrees = -1;
        else AIInput[groupindex][clockindex][userindex] = Math.round(itm.degrees+180);
        }
        let AIresponseGroups = new Array(global.maxgroups);
        let AIresponse = tools.createArray(global.maxgroups, global.maxusers,0);
        for(let i = 0; i < global.maxgroups; i++){
        //TODO: implement to read return analysis AI. Replace the string path with input data of type array.
        if(runmode=="debug"){
            AIresponseGroups[i] = await aiPrediction.prediction(AIInput[i],model);
        } else {
            AIresponseGroups[i] = slowAnalysis.createLabels(AIInput[i],8,2);
        }
        let offset = aiHopInterval + aiEvalFrames;
        for(let j = 0; j < global.maxusers; j++){
            let lastIndex = AIresponseGroups[i].length-1;
            let firstIndex = AIresponseGroups[i].length-1-offset;
            let isHerding =
            AIresponseGroups[i][lastIndex][j] &&
            AIresponseGroups[i][firstIndex][j];
            AIresponse[i][j] = isHerding
        }
        }
        for(let groupIndex in AIresponse){
        for(let userIndex in AIresponse[groupIndex]){
            let value = AIresponse[groupIndex][userIndex];
            let sessionKey = users[groupIndex][userIndex];
            if(sessionKey=="undefined")sessionKey = `npc_${groupIndex}_${userIndex}`
            dbHandler.updateUserdataHerding(sessionKey, clockCounter, value)
        }
        }
        io.sockets.emit("herdingStatus",AIresponse);
        if(clockCounter%20==1){
        // Check every half minute who are the users with the most herding behaviour per group. Switch these users
        let clockOffset = clockCounter-60 + 1;
        let rawherdingdata = dbHandler.getUserdataByClock(clockOffset);
        let herdingdata = new Array(global.maxgroups).fill(0).map(() => new Object());
        let groupherdingdata = new Array(global.maxgroups).fill(0);
        let hasHerded = 0;
        for(let entry of rawherdingdata){
            if(entry.sessionkey.indexOf("npc_")!=-1)continue;
            if(herdingdata[entry.groupid][entry.sessionkey] === undefined){
            herdingdata[entry.groupid][entry.sessionkey] = 0;
            }
            herdingdata[entry.groupid][entry.sessionkey] += entry.isherding;
            groupherdingdata[entry.groupid] += entry.isherding;
            hasHerded |= entry.isherding;
        }
        if(hasHerded){
            let maxherdingindexes = tools.findIndicesOfMax(groupherdingdata, 2);
            let herderid1 = tools.findKeysOfMax(herdingdata[maxherdingindexes[0]], 1)[0];
            let herderid2 = tools.findKeysOfMax(herdingdata[maxherdingindexes[1]], 1)[0];
            let herderid1_index = users[maxherdingindexes[0]].indexOf(herderid1);
            let herderid2_index = users[maxherdingindexes[1]].indexOf(herderid2);
            dbHandler.updateSession(herderid1, {groupid:maxherdingindexes[1]});
            dbHandler.updateSession(herderid2, {groupid:maxherdingindexes[0]});
            global.herdupdate = {};
            global.herdupdate[herderid1] = {groupid:maxherdingindexes[1], userindex:herderid2_index};
            global.herdupdate[herderid2] = {groupid:maxherdingindexes[0], userindex:herderid1_index};
            io.sockets.emit("groupupdate",global.herdupdate);
            logger.verbose("herders", {herderid1:herderid1, herderid2:herderid2});
            logger.verbose("maxherdingindexes", {groupherdingdata:groupherdingdata, hasHerded:hasHerded, maxherdingindexes:maxherdingindexes});
        } else {
            logger.verbose("herdupdate send", {message:"no update"});
        }
        logger.verbose("herdingdata", herdingdata);
        }
    }
    clockCounter++;
    if(clockCounter>=Math.pow(2,32))clockCounter=0;

    }, global.clockspeed);
}

module.exports = {
    initTimer : initTimer
}
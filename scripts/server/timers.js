// Arm users every second and write last behaviour into db
function npcMove(){
  for(let groupIndex in players){
    for(let userIndex in players[groupIndex]){
      if(players[groupIndex][userIndex].npc == true){
        players[groupIndex][userIndex].move(players[groupIndex]);
        players[groupIndex][userIndex].save(groupIndex,userIndex);
      }
    }
  }
}

async function groupSwitch(){
  let now = performance.now();
  // Check every half minute who are the users with the most herding behaviour per group. Switch these users
  // let clockOffset = global.clockCounter-60 + 1;
  let groupherdingdata = new Array(global.maxgroups).fill(0);
  let hasHerded = false;
  global.herdingResponse.forEach((group,groupIndex)=>{
    let herding = 0;
    group.forEach((value) =>{
      herding+=value;
    });
    if(herding > 0) hasHerded = true;
    groupherdingdata[groupIndex] = herding;
  });

  console.log("global.herdingResponse", global.herdingResponse)
  console.log("groupherdingdata", groupherdingdata)
  if(hasHerded){
    let maxherdingindexes = tools.findIndicesOfMax(groupherdingdata, 2);
    let herderid1_index = tools.findKeysOfMax(global.herdingResponse[maxherdingindexes[0]], 1)[0];
    let herderid2_index = tools.findKeysOfMax(global.herdingResponse[maxherdingindexes[1]], 1)[0];
    let herderid1 = players[maxherdingindexes[0]][herderid1_index].sessionID
    let herderid2 = players[maxherdingindexes[1]][herderid2_index].sessionID
    console.log("herderid1", herderid1_index, herderid1)
    console.log("herderid2", herderid2_index, herderid2)
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
  logger.verbose("herdingdata", global.herdingResponse);

  global.herdingResponse = tools.createArray(global.maxgroups, global.maxusers,0);
  console.log("benchmark TIMER#groupSwitch:", performance.now() - now);
}

async function analyzeHerd(){
  let now = performance.now();
  let AIresponse = tools.createArray(global.maxgroups, global.maxusers,0);
  global.herdingQueue.forEach((group,groupIndex) => {
    global.herdingQueue[groupIndex].shift();
    global.herdingQueue[groupIndex].push(new Array(global.maxusers).fill(-1));
    //Do calucation and prediction
    let AIframes = [];
    if(runmode=="debug"){
      AIframes = global.ML.prediction(global.herdingQueue[groupIndex],model);
    } else {
      AIframes= slowAnalysis.createLabels(global.herdingQueue[groupIndex],8,2);
    }

    //Writing predictions to AIresponse (2D array)
    let offset = global.aiHopInterval + global.aiEvalFrames;
    for(let userIndex = 0; userIndex < global.maxusers; userIndex++){
      let lastIndex = AIframes.length-1;
      let firstIndex = AIframes.length-1-offset;
      let isHerding =
        AIframes[lastIndex][userIndex] &&
        AIframes[firstIndex][userIndex];
      let sessionKey = players[groupIndex][userIndex].sessionID;
      // dbHandler.updateUserdataHerding(sessionKey, global.clockCounter, isHerding);
      AIresponse[groupIndex][userIndex] = isHerding;
      global.herdingResponse[groupIndex][userIndex] += isHerding;
    }
  });
  io.sockets.emit("herdingStatus",AIresponse);
  console.log("benchmark TIMER#analyzeHerd:", performance.now() - now);
}

function initTimer(){
  global.clockCounter = dbHandler.getHighestClock()+1;
  setInterval(async () => {
    io.sockets.emit("clock",global.clockCounter);
    logger.info("clock", {index:global.clockCounter})
    npcMove();
    analyzeHerd(clockCounter);
    if(global.clockCounter%20==1){
      await groupSwitch();
    }
    global.clockCounter++;
    if(global.clockCounter>=Math.pow(2,32))global.clockCounter=0;

  }, global.clockspeed);
}

module.exports = {
    initTimer : initTimer
}

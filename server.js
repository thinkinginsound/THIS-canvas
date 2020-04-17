(async () => {
let chalk = require('chalk'); // Required for console.log coloring
let statusTotal = 7;
let statusIndex = 1;

// ---------------------------- Import libraries ---------------------------- //
statusPrinter(statusIndex++, "Loading modules");

const runmode = process.env.RUNMODE || "debug"

const ip = require('ip');
const minimist = require('minimist')
const sass = require('sass');

const express = require('express');
const app = express()
const path = require('path');
const server = require('http').createServer(app);
const io = require('socket.io')(server);
const express_session = require("express-session");
const sharedsession = require("express-socket.io-session");
const MobileDetect = require('mobile-detect');

let tf;
let aiPrediction;
let slowAnalysis;
let aiHopInterval;
let aiEvalFrames;
if(runmode=="debug"){
  tf = require("@tensorflow/tfjs-node");
  aiPrediction = require("./scripts/analysisAI/predict");
  aiHopInterval = 2; // h
  aiEvalFrames = 6;  // n
} else {
  slowAnalysis = require("./scripts/analysisAI/slowAnalysis");
  aiHopInterval = 2; // h
  aiEvalFrames = 8;  // n
}
const NPC = require("./scripts/npcAI/boidNPC").boidNPC;

const tools = require("./scripts/tools");

// ---------------------------------- Vars ---------------------------------- //
statusPrinter(statusIndex++, "Init Vars");

process.argv.splice(0,2);
const argv = minimist(process.argv);

global.nodePackage = require('./package.json');
global.port = process.env.PORT || argv.port || 8080;
const webRoot = "public_html";
const verbose = argv.v!=undefined || argv.verbose!=undefined
global.maxgroups = 4;
global.maxusers = 4;
global.frameamount = 30;
global.npcCanvasWidth = 40;
global.npcCanvasHeight = 40;
global.clockspeed = 500;

global.npcs =  tools.createArray(maxgroups, maxusers, "undefined");
global.users = tools.createArray(maxgroups, maxusers, "undefined");

global.model = undefined; //prepared variable for the model

// -------------------------------- Init DB --------------------------------- //
statusPrinter(statusIndex++, "Init Database");
const SQLiteHandler = require('./scripts/dbHandlers/sqliteHandler.js');
const dbHandler = new SQLiteHandler({
  filename:`database${(runmode!="production"?'_'+runmode:"")}.db`,
  prefix:"cv_"
});
if(!await dbHandler.versionCheck()){
  await dbHandler.updateTables();
}

// Write private key to db
let privatekey = await dbHandler.getRow("system", ['value'], {mkey: 'privatekey'});
if(!privatekey){
  privatekey = tools.randomKey(16);
  dbHandler.insert("system", {mkey:'privatekey',value:privatekey});
} else privatekey = privatekey.value;

// Remove old data from database
await dbHandler.truncateTable("sessions");
await dbHandler.truncateTable("userdata");

// ------------------------------ Compile scss ------------------------------ //
statusPrinter(statusIndex++, "Compile scss");
let bootstrap_scss = sass.renderSync({file: "scss/bootstrap_override.scss"});

// ------------------------------- Serve web -------------------------------- //
statusPrinter(statusIndex++, "Init Webserver");

if (typeof(PhusionPassenger) !== 'undefined') {
    PhusionPassenger.configure({ autoInstall: false });
    port = 'passenger'
}

// Init express session
let session = express_session({
    secret: privatekey,
    resave: true,
    saveUninitialized: true
});
app.use(session);

// Serve static webfolder
app.use("/", express.static(path.join(__dirname, webRoot)))

// Serve socket.io
app.use("/assets/libs/socket.io", express.static(path.join(__dirname, 'node_modules/socket.io-client/dist/')));

// Serve socket.io
app.use("/assets/libs/p5", express.static(path.join(__dirname, 'node_modules/p5/lib/')));

// Serve JQuery
app.use('/assets/libs/jquery', express.static(__dirname + '/node_modules/jquery/dist/'));
// Serve Popper.JS
app.use('/assets/libs/popper', express.static(__dirname + '/node_modules/@popperjs/core/dist/umd'));

// Serve Bootstrap
app.use("/assets/libs/bootstrap/js/", express.static(path.join(__dirname, 'node_modules/bootstrap/dist/js/')));
app.use('/assets/libs/bootstrap/css/bootstrap.css', function (req, res, next) {
  res.setHeader('Content-disposition', 'attachment; filename=bootstrap.css');
  res.setHeader('Content-type', 'text/css');
  res.send(bootstrap_scss.css.toString())
})

// ---------------------------- Machine Learning ---------------------------- //
statusPrinter(statusIndex++, "Init Machine Learning");
for(let npcGroupIndex in npcs){
  for(let npcUserIndex in npcs[npcGroupIndex]){
    npcs[npcGroupIndex][npcUserIndex] = new NPC(
      global.npcCanvasWidth,
      global.npcCanvasHeight,
      tools.randomInt(global.npcCanvasWidth),
      tools.randomInt(global.npcCanvasHeight)
    );
  }
}
if(runmode=="debug"){
  async function loadModelFile(modelPath){
    model = await tf.loadLayersModel(modelPath); //path: 'file://../../data/model/model.json'
  }
  loadModelFile("file://data/model/model.json");
}
// ---------------------------- Socket listener ----------------------------- //
statusPrinter(statusIndex++, "Init Socket.IO");
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
    socket.handshake.session.save();
    await generateGroupID();
    if(verbose)console.log(`user connected with id: ${socket.handshake.sessionID.slice(0,8)}... And type: ${md?'mobile':"browser"}`);
  } else {
    groupid = socket.handshake.session.groupid
    userindex = socket.handshake.session.userindex
    md = socket.handshake.session.md
    dbHandler.updateSession(socket.handshake.sessionID);
    if(verbose)console.log(`user reconnected with id: ${socket.handshake.sessionID.slice(0,8)}...`);
  }

  socket.on('ready', (data, fn) => {
    socket.emit("groupid", [groupid, userindex]);
    fn({
      groupid:groupid,
      userindex:userindex,
      maxgroups:maxgroups,
      maxusers:maxusers,
      canvaswidth:global.npcCanvasWidth,
      canvasheight:global.npcCanvasHeight
    })
  })

  socket.on('drawpixel', (data) => {
    dbHandler.updateSession(socket.handshake.sessionID);
    data.groupid = groupid;
    dbHandler.insertUserdata(socket.handshake.sessionID, data);
    socket.broadcast.emit('drawpixel', data);
    lastReceived = Date.now();
  });

  socket.on('disconnect', function(){
    if(verbose)console.log(`user disconnected with id: ${socket.handshake.sessionID.slice(0,8)}...`);
  });
  async function generateGroupID(){
    let groups = await dbHandler.getSessionGroups();
    let groupsSize = groups.map(x => x.length);
    groupid = groupsSize.indexOf(Math.min(...groupsSize));
    userindex = users[groupid].indexOf("undefined");

    users[groupid][userindex] = socket.handshake.sessionID;
    dbHandler.insertSession(socket.handshake.sessionID, groupid, md);

    // Save session specific data
    socket.handshake.session.groupid = groupid;
    socket.handshake.session.userindex = userindex;
    socket.handshake.session.save();
  }
});

// --------------------------------- Timers --------------------------------- //
// Arm users every second and write last behaviour into db
let clockCounter = 0;
setInterval(async () => {
  io.sockets.emit("clock",clockCounter);
  console.log("clock", clockCounter)

  // NPC
  for(let groupIndex in users){
    for(let userIndex in users[groupIndex]){
      if(users[groupIndex][userIndex] == "undefined"){
        let prevX = npcs[groupIndex][userIndex].xPos;
        let prevY = npcs[groupIndex][userIndex].yPos;
        npcs[groupIndex][userIndex].move(npcs[groupIndex]);
        let sessionKey = `npc_${groupIndex}_${userIndex}`
        let newX = npcs[groupIndex][userIndex].xPos;
        let newY = npcs[groupIndex][userIndex].yPos;
        let distance = tools.pointDist(prevX, prevY, newX, newY)
        var rad = Math.atan2(newY - prevY, prevX - newX);
        var deg = rad * (180 / Math.PI);
        let sendable = {
          sessionkey: sessionKey,
          mouseX: newX/npcCanvasWidth,
          mouseY: newY/npcCanvasWidth,
          degrees:deg,
          distance:distance,
          groupid: groupIndex,
          clock: clockCounter
        }
        // console.log("npcmove", sendable)
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
    // console.log("users[0]", users[0]);
    // console.log("AIInput[0]", AIInput[0]);
    // console.log("AIresponseGroups[0]", AIresponseGroups[0]);
    // console.log("AIresponse", AIresponse);
    // console.log("users", users);
    for(let groupIndex in AIresponse){
      for(let userIndex in AIresponse[groupIndex]){
        let value = AIresponse[groupIndex][userIndex];
        let sessionKey = users[groupIndex][userIndex];
        if(sessionKey=="undefined")sessionKey = `npc_${groupIndex}_${userIndex}`
        // console.log("store AI", sessionKey, clockCounter, value)
        dbHandler.updateUserdataHerding(sessionKey, clockCounter, value)
      }
    }
    io.sockets.emit("herdingStatus",AIresponse);
  }
  clockCounter++;
  if(clockCounter>=Math.pow(2,32))clockCounter=0;

}, global.clockspeed);

// ---------------------------- Completed ----------------------------- //
server.listen(port, () => console.log(`App listening on ${ip.address()}:${port}`))
console.log(chalk.cyan('      Setup Completed'));

function statusPrinter(index,message){
  console.log(chalk.cyan(`(${index}/${statusTotal}) ${message}`));
}
})();

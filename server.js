(async () => {
// ------------------------ Initialize custom logger ------------------------ //
// https://github.com/winstonjs/winston#usage
const winston = require('winston');
const logger = winston.createLogger({
  level: 'debug',
  format: winston.format.json(),
  transports: [
    new winston.transports.File({ filename: 'logs/error.log', level: 'error' }),
    new winston.transports.File({ filename: 'logs/combined.log' })
  ]
});

logger.add(new winston.transports.Console({
  format: winston.format.combine(
    winston.format.splat(),
    winston.format.simple()
  )
}));

let chalk = require('chalk'); // Required for console coloring
let statusTotal = 6;
let statusIndex = 1;

// ---------------------------- Import libraries ---------------------------- //
statusPrinter(statusIndex++, "Loading modules");

global.runmode = process.env.RUNMODE || "RUNTIME"

const ip = require('ip');
const minimist = require('minimist')

global.express = require('express');
global.app = express()
const server = require('http').createServer(app);
const io = require('socket.io')(server);
const express_session = require("express-session");
const sharedsession = require("express-socket.io-session");
const MobileDetect = require('mobile-detect');

const MLM = require("./scripts/server/machineLearning").MLManager;
let ML = undefined;
let aiPrediction;
let slowAnalysis;
let aiHopInterval;
let aiEvalFrames;
if(runmode=="debug"){
  ML = new MLM("file:///data/model/model.json",4);
  aiHopInterval = 2; // h
  aiEvalFrames = 6;  // n
} else {
  slowAnalysis = require("./scripts/analysisAI/slowAnalysis");
  aiHopInterval = 2; // h
  aiEvalFrames = 8;  // n
}
const NPC = require("./scripts/npcAI/boidNPC").boidNPC;

global.tools = require("./scripts/tools");
const serveWeb = require("./scripts/server/serveWeb");
const database = require("./scripts/server/database");
const timers = require("./scripts/server/timers");
// ---------------------------------- Vars ---------------------------------- //
statusPrinter(statusIndex++, "Init Vars");

process.argv.splice(0,2);
const argv = minimist(process.argv);

global.nodePackage = require('./package.json');
global.port = process.env.PORT || argv.port || 8080;
global.webRoot = "public_html";
const verbose = argv.v!=undefined || argv.verbose!=undefined
const purgedb = argv.purgedb!=undefined
global.maxgroups = 4;
global.maxusers = 4;
global.frameamount = 30;
global.npcCanvasWidth = 40;
global.npcCanvasHeight = 30;
global.clockspeed = 1000;
global.sessionduration = 1000*60*5; // 5 minutes in ms;

global.players =  tools.createArray(maxgroups, maxusers, new NPC(
  global.npcCanvasWidth,
  global.npcCanvasHeight,
  tools.randomInt(global.npcCanvasWidth),
  tools.randomInt(global.npcCanvasHeight)
));
global.herdupdate = {};

global.model = undefined; //prepared variable for the model

// -------------------------------- Init DB --------------------------------- //
statusPrinter(statusIndex++, "Init Database");
await database.initDatabase(runmode, purgedb)

// ------------------------------- Serve web -------------------------------- //
statusPrinter(statusIndex++, "Init Webserver");

if (typeof(PhusionPassenger) !== 'undefined') {
    PhusionPassenger.configure({ autoInstall: false });
    port = 'passenger'
}

// Init express session
global.session = express_session({
    secret: global.privatekey,
    resave: true,
    saveUninitialized: true
});
serveWeb.serveStaticWebroot(webRoot);
serveWeb.serveLibraries();


// ---------------------------- Machine Learning ---------------------------- //
statusPrinter(statusIndex++, "Init Machine Learning");

// -> give user groups ML.prediction(usergroups)
// -> Request predicted data ML.getHeardingList()

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

// --------------------------------- Timers --------------------------------- //

timers.initTimer();

// ---------------------------- Completed ----------------------------- //
server.listen(port, () => logger.http(`App listening on ${ip.address()}:${port}`))
logger.debug(chalk.cyan('      Setup Completed'));

function statusPrinter(index,message){
  logger.debug(chalk.cyan(`(${index}/${statusTotal}) ${message}`));
}
})();

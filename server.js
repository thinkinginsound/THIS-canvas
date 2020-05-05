(async () => {
// ------------------------ Initialize custom logger ------------------------ //
// https://github.com/winstonjs/winston#usage
const winston = require('winston');
global.logger = winston.createLogger({
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
let statusTotal = 7;
let statusIndex = 1;

// ---------------------------- Import libraries ---------------------------- //
statusPrinter(statusIndex++, "Loading modules");

global.runmode = process.env.RUNMODE || "RUNTIME"

const ip = require('ip');
const minimist = require('minimist')

global.express = require('express');
global.app = express()
global.server = require('http').createServer(app);
global.io = require('socket.io')(server);
global.express_session = require("express-session");
global.sharedsession = require("express-socket.io-session");

if(runmode == "debug"){
  const MLM = require("./scripts/server/machineLearning").MLManager;
}
const NPC = require("./scripts/npcAI/boidNPC").boidNPC;
global.ML = undefined;
global.slowAnalysis;
global.aiHopInterval;
global.aiEvalFrames;

global.tools = require("./scripts/tools");
const serveWeb = require("./scripts/server/serveWeb");
const database = require("./scripts/server/database");
const timers = require("./scripts/server/timers");
const socket = require("./scripts/server/socket");
// ---------------------------------- Vars ---------------------------------- //
statusPrinter(statusIndex++, "Init Vars");

process.argv.splice(0,2);
const argv = minimist(process.argv);

global.nodePackage = require('./package.json');
global.port = process.env.PORT || argv.port || 8080;
global.webRoot = "public_html";
global.verbose = argv.v!=undefined || argv.verbose!=undefined
global.purgedb = argv.purgedb!=undefined
global.maxgroups = 4;
global.maxusers = 4;
global.frameamount = 30;
global.npcCanvasWidth = 40;
global.npcCanvasHeight = 30;
global.clockspeed = 1000;
global.clockCounter = 0;
global.sessionduration = 1000*60*1; // 5 minutes in ms;
global.herdingQueue = [];
global.herdingResponse = tools.createArray(global.maxgroups, global.maxusers,0);
for(let i = 0; i < global.maxgroups; i++){
  global.herdingQueue[i] = tools.createArray(global.frameamount, global.maxusers,-1);
}

global.players = tools.createArray(maxgroups, maxusers, "undefined");
let npcID = 0
players.forEach((group,groupIndex)=>{
  group.forEach((player,playerIndex)=>{
    players[groupIndex][playerIndex] = new NPC(
      global.npcCanvasWidth,
      global.npcCanvasHeight,
      tools.randomInt(global.npcCanvasWidth),
      tools.randomInt(global.npcCanvasHeight),
      `npc_${npcID++}`
    )
  })
})

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
if(runmode=="debug"){
  ML = new MLM("file:///data/model/model.json",4);
  aiHopInterval = 2; // h
  aiEvalFrames = 6;  // n
} else {
  slowAnalysis = require("./scripts/analysisAI/slowAnalysis");
  aiHopInterval = 2; // h
  aiEvalFrames = 8;  // n
}
// -> give user groups ML.prediction(usergroups)
// -> Request predicted data ML.getHeardingList()

// ---------------------------- Socket listener ----------------------------- //
statusPrinter(statusIndex++, "Init Socket.IO");
socket.initSocket();

// --------------------------------- Timers --------------------------------- //
statusPrinter(statusIndex++, "Init Timers");
timers.initTimer();

// ---------------------------- Completed ----------------------------- //
server.listen(port, () => logger.http(`App listening on ${ip.address()}:${port}`));
dbHandler.insertLogE("server", "status", "Server started successfully");
logger.debug(chalk.cyan('      Setup Completed'));

function statusPrinter(index,message){
  logger.debug(chalk.cyan(`(${index}/${statusTotal}) ${message}`));
}
})();

(async () => {
let chalk = require('chalk'); // Required for console.log coloring
let statusTotal = 6;
let statusIndex = 1;

// ---------------------------- Import libraries ---------------------------- //
statusPrinter(statusIndex++, "Loading modules");

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

const tools = require("./scripts/tools");

// ---------------------------------- Vars ---------------------------------- //
statusPrinter(statusIndex++, "Init Vars");

process.argv.splice(0,2);
const argv = minimist(process.argv);

global.nodePackage = require('./package.json');
const port = process.env.PORT || argv.port || 8080;
const runmode = process.env.RUNMODE || "debug"
const webRoot = "public_html";
const verbose = argv.v!=undefined || argv.verbose!=undefined
global.maxgroups = 4;

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
// Hier komt een machine learning push test hihi hoehoe

// ---------------------------- Socket listener ----------------------------- //
statusPrinter(statusIndex++, "Init Socket.IO");
io.use(sharedsession(session, {
    autoSave:true
}));
io.on('connection', async function(socket){
  let sessionExists = await dbHandler.checkExistsSession(socket.handshake.sessionID);
  let groupid = -1;
  if(!sessionExists){
    let md = new MobileDetect(socket.handshake.headers['user-agent']).mobile()!=null;
    let groups = await dbHandler.getSessionGroups();
    let groupsSize = groups.map(x => x.length);
    groupid = groupsSize.indexOf(Math.min(...groupsSize));
    dbHandler.insertSession(socket.handshake.sessionID, groupid, md);

    // Save session specific data
    socket.handshake.session.groupid = groupid;
    socket.handshake.session.md = md;
    socket.handshake.session.save();
    if(verbose)console.log(`user connected with id: ${socket.handshake.sessionID.slice(0,8)}... And type: ${md?'mobile':"browser"}`);
  } else {
    groupid = socket.handshake.session.groupid
    md = socket.handshake.session.md
    dbHandler.updateSession(socket.handshake.sessionID);
    if(verbose)console.log(`user reconnected with id: ${socket.handshake.sessionID.slice(0,8)}...`);
  }

  socket.on('ready', (data) => {
    socket.emit("groupid", groupid);
  })

  socket.on('drawpixel', (data) => {
    dbHandler.updateSession(socket.handshake.sessionID);
    data.groupid = groupid;
    dbHandler.insertUserdata(socket.handshake.sessionID, data);
    socket.broadcast.emit('drawpixel', data);
  });

  socket.on('disconnect', function(){
    if(verbose)console.log(`user disconnected with id: ${socket.handshake.sessionID.slice(0,8)}...`);
  });
});

// --------------------------------- Timers --------------------------------- //
// Arm users every second and write last behaviour into db
let clockCounter = 0;
setInterval(async () => {
  io.sockets.emit("clock",clockCounter);
  console.log("clock", clockCounter)
  let clockOffset = clockCounter-30;
  let userdata = await dbHandler.getUserdataByClock(clockOffset-1);
  let userdataGroups = [];
  let userdataGroupKeys = [];
  for(let i = 0; i < global.maxgroups; i++){
    userdataGroups[i] = {}
  }
  for(let itm of userdata){
    // console.log("itm", itm.groupid, itm.clock, itm.clock - clockOffset)
    if(userdataGroups[itm.groupid][itm.sessionkey]==undefined)
      userdataGroups[itm.groupid][itm.sessionkey]  = Array(30).fill(-1)
    userdataGroups[itm.groupid][itm.sessionkey][itm.clock - clockOffset ] = Math.round(itm.degrees+180);
  }
  for(let groupid in userdataGroups){
    userdataGroupKeys[groupid] = Object.keys(userdataGroups[groupid]);
    userdataGroups[groupid] = Object.values(userdataGroups[groupid]);
  }
  console.log("userdataGroups", userdataGroups, userdataGroupKeys)
  clockCounter++;
  if(clockCounter>=Math.pow(2,32))clockCounter=0;

}, 1000);
// // Cleanup database every hour. Delete entries older than a day
// setInterval(()=>{
//   dbHandler.cleanupSession();
//   dbHandler.cleanupUserdata();
// }, 1000*60*60);

// ---------------------------- Completed ----------------------------- //
server.listen(port, () => console.log(`App listening on ${ip.address()}:${port}`))
console.log(chalk.cyan('      Setup Completed'));

function statusPrinter(index,message){
  console.log(chalk.cyan(`(${index}/${statusTotal}) ${message}`));
}
})();

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

let privatekey = await dbHandler.getRow("system", ['value'], {mkey: 'privatekey'});
if(!privatekey){
  privatekey = tools.randomKey(16);
  dbHandler.insert("system", {mkey:'privatekey',value:privatekey});
} else privatekey = privatekey.value;
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
  if(!sessionExists){
    dbHandler.insertSession(socket.handshake.sessionID);
    if(verbose)console.log(`user connected with id: ${socket.handshake.sessionID.slice(0,8)}...`);
  } else {
    dbHandler.updateSession(socket.handshake.sessionID);
    if(verbose)console.log(`user reconnected with id: ${socket.handshake.sessionID.slice(0,8)}...`);
  }
  socket.emit('init', {
    runmode: runmode
  });
  socket.on('drawing', (data) => socket.broadcast.emit('drawing', data));
  socket.on('mousedata', (data) => {
    dbHandler.insertUserdata(socket.handshake.sessionID, data);
  });
  socket.on('disconnect', function(){
    if(verbose)console.log(`user disconnected with id: ${socket.handshake.sessionID.slice(0,8)}...`);
  });
});

// ---------------------------- Completed ----------------------------- //
server.listen(port, () => console.log(`App listening on ${ip.address()}:${port}`))
console.log(chalk.cyan('      Setup Completed'));

function statusPrinter(index,message){
  console.log(chalk.cyan(`(${index}/${statusTotal}) ${message}`));
}
// Call AI every .2 seconds
setInterval(()=>{
  let userdata = dbHandler.getUserdataByTimeframe("-1 second");
  // Do something with data
}, 200);

// // Cleanup database every hour. Delete entries older than a day
// setInterval(()=>{
//   dbHandler.cleanupSession();
//   dbHandler.cleanupUserdata();
// }, 1000*60*60);
})();

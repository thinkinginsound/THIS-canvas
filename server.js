let chalk = require('chalk'); // Required for console.log coloring
let statusTotal = 4;
let statusIndex = 1;

// ---------------------------- Import libraries ---------------------------- //
statusPrinter(statusIndex++, "Loading modules");

const ip = require('ip');
const minimist = require('minimist')

const express = require('express');
const app = express()
const path = require('path');
const server = require('http').createServer(app);
const io = require('socket.io')(server);

// ---------------------------------- Vars ---------------------------------- //
statusPrinter(statusIndex++, "Init Vars");

process.argv.splice(0,2);
const argv = minimist(process.argv);

const port = process.env.PORT;// || argv.port || 8080;
const runmode = process.env.RUNMODE || "debug"
const webRoot = "public_html";

// ------------------------------- Serve web -------------------------------- //
statusPrinter(statusIndex++, "Init Webserver");
app.use("/", express.static(path.join(__dirname, webRoot)))
app.use("/assets/libs/socket.io", express.static(path.join(__dirname, 'node_modules/socket.io-client/dist/')))

// ---------------------------- Socket listener ----------------------------- //
statusPrinter(statusIndex++, "Init Socket.IO");
io.on('connection', function(socket){
    console.log('a user connected');
    socket.emit('init', {
      runmode: runmode
    });
    socket.on('drawing', (data) => socket.broadcast.emit('drawing', data));
    socket.on('disconnect', function(){
        console.log('user disconnected');
    });
});
server.listen(port, () => console.log(`App listening on ${ip.address()}:${port}`))
console.log(chalk.cyan('      Setup Completed'));

function statusPrinter(index,message){
    console.log(chalk.cyan(`(${index}/${statusTotal}) ${message}`));
}

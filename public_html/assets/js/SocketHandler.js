/*
Purpose: The SocketHandler class handles all communication with the server

Functions:
*/

class SocketHandler {
  constructor(){
    this.socket = undefined;
  }
  startSocket(onReady = (socket)=>console.log("onReady"), timeout = 10){
    this.socket = io();
    window.socket = this.socket
    new Promise( (res, rej) => {
      let counter = 0;
      setInterval(()=>{
        if(typeof this.socket!="undefined") res();
        else if(++counter>timeout){
          console.log("Rejected")
          rej()
        }
      }, 500);
    }).then(()=>{
      this.socket.emit("ready", "", (response)=>{
        console.log("socket ready")
        window.state.server.sessionkey = response.sessionkey;
        window.state.server.groupid = response.groupid;
        window.state.server.userid = response.userindex;
        window.state.server.maxgroups = response.maxgroups;
        window.state.server.maxusers = response.maxusers;
        window.state.server.maxPixelsWidth = response.canvaswidth;
        window.state.server.maxPixelsHeight = response.canvasheight;
        window.state.server.clockspeed = response.clockspeed;
        window.state.server.sessionduration = response.sessionduration;
        window.state.server.sessionstarted = response.sessionstarted;

        window.state.session.currentXPos = randomInt(window.state.server.maxPixelsWidth); //random x position in canvas
        window.state.session.currentYPos = randomInt(window.state.server.maxPixelsHeight); // random y positon in canvas
        window.state.session.herdingstatus = createArray(window.state.server.maxgroups, window.state.server.maxusers, 0);
        window.state.session.pixelArray = createArray(window.state.server.maxPixelsWidth, window.state.server.maxPixelsHeight, -1);
        window.state.session.lastPixelPos = [window.state.session.currentXPos, window.state.session.currentYPos];

        onReady(this.socket);
        window.state.server.ready = true;
      });
    }).catch(()=>{console.log("error")});
  }

  addListener(id, action){ this.socket.on(id,action); }
}

export { SocketHandler };

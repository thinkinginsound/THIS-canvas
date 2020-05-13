/*
Purpose: The SocketHandler class handles all communication with the server

Functions:
*/

import { ErrorModal } from  "./modals/errorModal.js"
import { EndModal } from  "./modals/endModal.js"
import { PixelObject } from "./pixelObject.js"
import Store from "./Store.js"

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
        Store.set("server/sessionkey", response.sessionkey);
        Store.set("session/group_id", response.groupid);
        Store.set("session/group_order", response.userindex);
        Store.set("server/maxgroups", response.maxgroups)
        Store.set("server/maxgroups", response.maxusers)
        Store.set("server/canvaswidth", response.canvaswidth)
        Store.set("server/canvasheight", response.canvasheight)
        Store.set("server/clockspeed", response.clockspeed)
        Store.set("server/sessionduration", response.sessionduration)
        Store.set("server/sessionstarted", response.sessionstarted)
        Store.set("session/username", response.username)
        Store.set("session/userNamesList", response.allUsernames)

        Store.set("session/currentXPos", randomInt(response.canvaswidth)); //random x position in canvas
        Store.set("session/currentYPos", randomInt(response.canvasheight)); // random y positon in canvas
        Store.set("session/herdingstatus", []);
        Store.set("session/herdinghistory", new Array(response.maxgroups).fill(0))
        Store.set("session/pixelArray", createArray(response.canvaswidth, response.canvasheight, -1))
        for(let xIndex in Store.get("session/pixelArray")){
          for(let yIndex in Store.get("session/pixelArray")[xIndex]){
            Store.get("session/pixelArray")[xIndex][yIndex] = new PixelObject(xIndex,yIndex)
          }
        }
        Store.set("session/lastPixelPos", [Store.get("session/currentXPos"), Store.get("session/currentYPos")]);

        this.bindListeners();
        onReady(this.socket);
        Store.set("server/ready", true);
      });
    }).catch(()=>{console.log("error")});
  }
  bindListeners(){
    // Session Revoked. There were too many users trying to login to the system
    this.addListener('sessionrevoked',function(data){
      let errorModal = new ErrorModal("Too many users", "Too many users are using the system at this moment. Please wait a few minutes and reload the page.");
      errorModal.show();
    });

    // Receives clock from server. Calls UI clock function.
    this.addListener('clock', (data)=>{
      console.log("clock", data)
      Store.set("session/serverarmed", true);
      Store.set("session/clock", data)
      window.uiHandler.onClock();
    })

    // Received a new pixel. Write to storage
    this.addListener('drawpixel', function(data){
      let valueX = Math.floor(data.mouseX);
      let valueY = Math.floor(data.mouseY);

      if(valueX<0) valueX = 0;
      else if(valueX>Store.get("server/canvaswidth")) valueX = Store.get("server/canvaswidth")-1;

      if(valueY<0) valueY = 0;
      else if(valueY>Store.get("server/canvasheight")) valueY = Store.get("server/canvasheight")-1;

      if(data.groupid != -1) Store.get("session/pixelArray")[valueX][valueY].setGroup(parseInt(data.groupid));
    })

    // Server updated clients herding status. Store and react.
    this.addListener('herdingStatus', function(data){
      if(Store.get("session/group_id") == -1 || Store.get("session/group_order") == -1)return;
      Store.set("session/isHerding", data[Store.get("session/group_id")][Store.get("session/group_order")])
      Store.set("session/herdingstatus", new Array(data.length).fill(0));
      for(let group in data){
        for(let user in data[group]){
          Store.get("session/herdingstatus")[group] += data[group][user];
        }
      }
      Store.get("session/herdinghistory").push(Store.get("session/isHerding"));
      window.audioclass.setIsHerding(
        Store.get("session/isHerding"),
        (Store.get("session/herdingstatus")[Store.get("session/group_id")]/Store.get("server/maxgroups")) * 100
      );
      console.log("herdingStatus", Store.get("session/herdingstatus")[Store.get("session/group_id")]);
    })

    // Server updated clients group status. Store and react.
    this.addListener('groupupdate', function(data){
      if(data.indexOf(Store.get("server/sessionkey"))!=-1){
        Store.set("session/group_id", data.groupid);
        Store.set("session/group_order", data.userindex);
        window.uiHandler.updateUserGroup();
      }
      console.log("groupupdate", data);
    })

    // Show endmodal on session expired
    socket.on('sessionexpired',(data)=>{
      let endModal = new EndModal();
      Store.set("server/ready", false);
      Store.set("session/hasPlayed", true);
      this.calcSheepBehavior(Store.get("session/herdinghistory"));
      // endModal.setSheepPercentage(Store.get("session/sheepPercentage"));
      endModal.setSheepPercentage(parseFloat(Math.random()*100).toFixed(2));
      endModal.show();
    });

    //Swap a username
    socket.on('updateUsernames',function(data){
      Store.get("session/userNamesList")[((data.group*Store.get("server/maxgroups"))+parseInt(data.index,10))] = data.name
      window.uiHandler.changeUser(((data.group*Store.get("server/maxgroups"))+parseInt(data.index,10)),data.name);
    });
  }
  addListener(id, action){ this.socket.on(id,action); }
  emit(id, payload){
    this.socket.emit(id, payload)
  }
//
  calcSheepBehavior(sheepArray){
    let arrAvg = sheepArray => sheepArray.reduce((a,b) => a + b, 0) / sheepArray.length;
    Store.set("session/sheepPercentage", arrAvg(sheepArray)*100)
    document.getElementById("sheepPercentage");
    return Store.get("session/sheepPercentage");
  }
}

export { SocketHandler };

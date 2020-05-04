// Modals
import { WelcomeModal } from  "./modals/welcomeModal.js"
import { ErrorModal } from  "./modals/errorModal.js"
import { EndModal } from  "./modals/endModal.js"

import { AudioClass } from  "./audioclass.js"
import { SocketHandler } from "./SocketHandler.js"
import { UIHandler } from "./UIHandler.js"

window.state = {
  server: {
    // Static variable retreived from server
    ready: false,
    maxgroups: 0,
    maxusers: 0,
    clockspeed: 1000,
    sessionduration: 1000*60*5, // 5 minutes in ms;
    maxPixelsWidth: 40,
    maxPixelsHeight: 30,
    sessionkey: -1,
    sessionstarted: 0
  },
  session: {
    // Changing variable, some retreived from server
    clock: -1,
    serverarmed: true,
    groupid: -1,
    userid: -1,
    isHerding: false,
    herdingstatus: [],
    sheepPercentage: 0,
    pixelArray: [],
    lastPixelPos: [null,null],
    currentXPos: 0,
    currentYPos: 0
  },
}

window.audioclass = new AudioClass();
window.uiHandler = new UIHandler();
window.socketHandler = new SocketHandler();

$(function() {
  let welcomeModal = new WelcomeModal();
  welcomeModal.setActionPositive((e)=>{
    setCookie("termsagreed", true)
    window.termsagreed = true;
    startApp();
    return true;
  })
  welcomeModal.show();
});

function startApp(){
  window.socketHandler.startSocket((socket)=>{
    window.audioclass.setGroupID(window.state.server.groupid);
    uiHandler.fillUI();
    socket.on('sessionrevoked',function(data){
      let errorModal = new ErrorModal("Too many users", "Too many users are using the system at this moment. Please wait a few minutes and reload the page.");
      errorModal.show();
    });

    socket.on('clock', (data)=>{
      console.log("clock", data)
      uiHandler.currentDrawPercentage = 0;
      window.state.session.serverarmed = true;
      window.state.session.clock = data
      calcPixelDistribution();
    })
    socket.on('drawpixel', function(data){
      let valueX = Math.floor(data.mouseX);
      let valueY = Math.floor(data.mouseY);

      if(valueX<0)valueX = 0;
      else if(valueX>window.state.server.maxPixelsWidth)valueX = window.state.server.maxPixelsWidth;

      if(valueY<0)valueY = 0;
      else if(valueY>window.state.server.maxPixelsHeight)valueY = window.state.server.maxPixelsHeight;

      window.state.session.pixelArray[valueX][valueY] = parseInt(data.groupid);
    })
    socket.on('herdingStatus', function(data){
      if(window.state.server.groupid == -1 || window.state.server.userid == -1)return;
      window.state.session.isHerding = data[window.state.server.groupid][window.state.server.userid];
      window.state.session.herdingstatus = data;
      window.audioclass.setIsHerding(window.state.session.isHerding);
      console.log("herdingStatus", window.state.session.isHerding);
    })
    socket.on('groupupdate', function(data){
      if(data.indexOf(window.state.server.sessionkey)!=-1){
        window.state.server.groupid = data.groupid;
        window.state.server.userid = data.userindex;
        $(".sidebar#sidebar_left #userlist .active").removeClass("active");
        let userindex = window.state.server.groupid * window.state.server.maxgroups + window.state.server.userid + 1;
        $(`.sidebar#sidebar_left #userlist #userlist_${userindex}`).addClass("active");
        if(typeof window.audioclass != "undefined"){
          window.audioclass.setGroupID(window.state.server.groupid);
        }
      }
      calcSheepBehavior(testSheepArray);
      console.log("groupupdate", data);
    })
    socket.on('sessionexpired',function(data){
      let endModal = new EndModal();
      window.state.server.ready = false;
      endModal.setSheepPercentage(window.state.session.sheepPercentage);
      endModal.show();
    });
  }, 10);
}

function calcPixelDistribution(){
  let distribution = new Array(window.state.server.maxgroups+1).fill(0);
  let maxPixels = window.state.server.maxPixelsWidth*window.state.server.maxPixelsHeight;
  for(let col of window.state.session.pixelArray){
    for(let row of col){
      distribution[row+1]++;
    }
  }
  for(let groupindex in distribution){
    let value = distribution[groupindex];
    let percentage = (value/maxPixels*100).toFixed(2);;
    $(".sidebar#sidebar_right #pixeldistribution #pixeldistribution_"+groupindex)
      .text(`${value} pixels, ${percentage}%`)
  }
}

let testSheepArray = [0, 1, 1, 0, 1, 1, 0, 0, 1, 0]; //aanpassen naar variabel
function calcSheepBehavior(sheepArray){
  let arrAvg = sheepArray => sheepArray.reduce((a,b) => a + b, 0) / sheepArray.length;
  window.state.session.sheepPercentage = arrAvg(sheepArray)*100;
  document.getElementById("sheepPercentage");
  return window.state.session.sheepPercentage;
}

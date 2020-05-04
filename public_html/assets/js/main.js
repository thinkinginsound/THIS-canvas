import { WelcomeModal } from  "./modals/welcomeModal.js"
import { ErrorModal } from  "./modals/errorModal.js"
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
    sessionkey: -1
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
$(function() {
  if(!checkCookie("termsagreed")){
    let welcomeModal = new WelcomeModal();
    welcomeModal.setActionPositive((e)=>{
      setCookie("termsagreed", true)
      window.termsagreed = true;
      startApp();
      return true;
    })
    welcomeModal.show();
  } else {
    window.termsagreed = true;
    startApp();
  }
});

function startApp(){
  window.socket = io(); // start connection with server via socket.io
  window.socket.on('sessionrevoked',function(data){
    let errorModal = new ErrorModal("Too many users", "Too many users are using the system at this moment. Please wait a few minutes and reload the page.");
    errorModal.show();
  });
}

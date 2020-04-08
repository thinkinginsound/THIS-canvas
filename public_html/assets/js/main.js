import { WelcomeModal } from  "./modals/welcomeModal.js"
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
}

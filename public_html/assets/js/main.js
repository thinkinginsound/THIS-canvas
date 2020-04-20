import { WelcomeModal } from  "./modals/welcomeModal.js"
import { ErrorModal } from  "./modals/errorModal.js"
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

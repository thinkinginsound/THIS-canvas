import { WelcomeModal } from  "./modals/welcomeModal.js"
import { EndModal } from  "./modals/endModal.js"
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
  $(this).find("#endmodal").click(()=>{
    console.log("endmodal clicked")
    let endModal = new EndModal();

    index.setDrawPercentage(window.drawPercentage);

    endModal.show();
  })
});

function setDrawPercentage(value) {
  this.drawPercentage = value;
  this.view.find("#drawPercentage").text(value);
}

function startApp(){
  window.socket = io(); // start connection with server via socket.io
}

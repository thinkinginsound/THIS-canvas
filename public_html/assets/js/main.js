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

function startTimer(duration, display) {
    var timer = duration, minutes, seconds;
    setInterval(function () {
        minutes = parseInt(timer / 60, 10);
        seconds = parseInt(timer % 60, 10);

        minutes = minutes < 10 ?  + minutes : minutes;
        seconds = seconds < 10 ? "0" + seconds : seconds;

        display.textContent = minutes + ":" + seconds;

        if (--timer < 0) {
            timer = duration;
        }
    }, 1000);
}

window.onload = function () {
    var fiveMinutes = 60 * 5,
        display = document.querySelector('#time');
    startTimer(fiveMinutes, display);
}; //https://stackoverflow.com/questions/20618355/the-simplest-possible-javascript-countdown-timer

function setDrawPercentage(value) {
  this.drawPercentage = value;
  this.view.find("#drawPercentage").text(value);
}

function startApp(){
  window.socket = io(); // start connection with server via socket.io
}

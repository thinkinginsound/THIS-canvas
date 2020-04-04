import { WelcomeModal } from  "./modals/welcomeModal.js"
$(function() {
  if(!checkCookie("termsagreed")){
    let welcomeModal = new WelcomeModal();
    console.log("welcomeModal", welcomeModal)
    welcomeModal.show();
  } else window.termsagreed = true
});

import { DefaultModal } from "./defaultModal.js"

export class WelcomeModal extends DefaultModal {
  constructor(){
    let options = {
      id:"welcome-modal",
      title:"The Black Sheep",
      positiveText:"Next",
      negativeText:"Disagree",
      showHeaderClose:false,
      showFooterClose:false,
      showFooterNegative:false,
      showFooterPositive:false,
    }

    super(options);
    this.setBody($(`
      <audio id="myAudio">
        <source src="testSound.mp3" type="audio/mpeg">
        Your browser does not support the audio element.
      </audio>
      <div>
        <div id="page1">
          <p> Welcome. Thank you for your participation!
          </br>
          </br><b>Here are some instructions:</b>
          </br> You can use the arrow keys to move one block at a time. Use the spacebar to draw a cube once the bar on the right side of the screen is filled.
          </br> Please stay until the end of the game. When the timer hits 0:00 another popup will appear.
          <img src="/assets/images/movementExample.svg" style="width:100%;height:100%;" class="padding"</img>
          </br> We use functional cookies for temporary storage of your impersonal id. If you continue you agree to the <a href="terms.html">terms</a> and indicate that you are over 13 years old.</p>
          <div role="group" aria-label="First group" id="agreeButton">
            <button type="button">Agree</button>
          </div>
          </div>
        <div id="page2">
          <p>Click the button to test your audio.</p>
          <div role="group" aria-label="First group" id="playButton">
            <button type="button">Play Audio</button>
          </div>
          </p>
        </div>
      </div>
    `));

    //<script>
    let sound = document.getElementById("myAudio");
      this.view.find("#playButton").click((event)=>{
        console.log("Hier speelt hij het geluid af");
      this.sound.play();
    })

    //</script>
    // Hide dom element with id 'page2'
    this.view.find("#page2").hide();
    this.view.find("#agreeButton").click((event)=>{
      // Hide dom element with id 'page1'
      this.view.find("#page1").hide();
      // Show dom element with id 'page2'
      this.view.find("#page2").show();
      this.setShowFooterPositive(true);
    })

    this.setActionPositive((e)=>{
      return true;
    })
    this.setActionNegative((e)=>{
      window.history.back();
      return false;
    })
  }
}

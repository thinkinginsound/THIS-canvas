import { DefaultModal } from "./defaultModal.js"

export class EndModal extends DefaultModal {
  constructor(){
    let options = {
      id:"end-modal",
      title:"The end",
      positiveText:"Agree",
      negativeText:"Disagree",
      showHeaderClose:false,
      showFooterClose:false,
      showFooterNegative:false,
      showFooterPositive:false,
    }
    super(options);
    this.setBody($(`
      <div>
        <p>Thank you for your participation!
        </br> While you were playing a game we were analysing your sheepbehaviour.
        </br>
        </br> <b><ins>sheep</ins>·be·ha·vi·our</b>
        </br> <small> <b> <i>noun</i> </b> UK (US <b> sheepbehavior </b>) </small>
        </br> ...
        </p>
        <div id="page1">
        Do you think you showed sheepbehaviour?
        </div>
        Never <button type="button" class="btn btn-primary" id="bleh">1</button>
        <button type="button" class="btn btn-primary" id="bleh">2</button>
        <button type="button" class="btn btn-primary" id="bleh">3</button>
        <button type="button" class="btn btn-primary" id="bleh">4</button>
        <button type="button" class="btn btn-primary" id="bleh">5</button> Constantly
        <div id="page2">
        You behaved like a sheep for ...% of the time
        Please fill in the google forms in the link below
        </br> insert link
        </div>
      </div>
    `));
    // Hide dom element with id 'page2'
    this.view.find("#page2").hide();

    // Run function when dom element with type/class 'button' and id 'bleh' is clicked
    this.view.find("button#bleh").click(()=>{
      // Hide dom element with id 'page1'
      this.view.find("#page1").hide();
      // Show dom element with id 'page2'
      this.view.find("#page2").show();
    })

    this.setActionPositive((e)=>{
      return true; // Hide model if return true
    })
    this.setActionNegative((e)=>{
      return false; // Hide model if return true
    })
  }
}

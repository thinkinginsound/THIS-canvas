import { DefaultModal } from "./defaultModal.js"

export class EndModal extends DefaultModal {
  constructor(){
    let options = {
      id:"end-modal",
      title:"Welcome",
      positiveText:"Agree",
      negativeText:"Disagree",
      showHeaderClose:false,
      showFooterClose:false,
      showFooterNegative:true,
    }
    super(options); //sheep.be.ha(onderstreept).vi.our
    this.setBody($(`
      <div>
        <p>Thank you for your participation!
        </br> While you were playing a game we were analysing your sheepbehaviour.
        </br>
        </br> <b><ins>sheep</ins>·be·ha·vi·our</b>
        </br> <small> <b> <i>noun</i> </b> UK (US <b> sheepbehavior </b>) </small>
        </br> ...
        </p>
        <button type="button" class="btn btn-primary" id="bleh">Button</button>
        <div id="page1">Page 1</div>
        <div id="page2">Page 2</div>
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

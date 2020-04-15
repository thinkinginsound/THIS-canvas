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
    super(options);
    this.setBody($(`
      <div>
        <p>Welcome to our app.</br>If you continue you agree to the <a href="terms.html">terms</a> and indicate that you are over 18 years old.</p>
      </div>
    `));
    this.setActionPositive((e)=>{
      return true;
    })
    this.setActionNegative((e)=>{
      window.history.back();
      return false;
    })
  }
}

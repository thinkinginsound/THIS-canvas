class UIHandler {
  constructor(){
    this.colorlist = ["#c10000", "#ff9900", "#009600", "#0058ff", "#ffff00", "#ff00ff", "#00ffff"]; // List of usable colors
    this.bgcolor = "#000";
    this.currentDrawPercentage = 0;
  }
  fillUI(){
    // Create distribution views
    let pixeldistributionView = $(".sidebar#sidebar_right #pixeldistribution");
    pixeldistributionView.empty()
    pixeldistributionView.append($(`
      <dt>Free</dt>
      <dd id="pixeldistribution_0">0 pixels</dd>
    `));
    for(let i = 0; i < window.state.server.maxgroups; i++){
      pixeldistributionView.append($(`
        <dt style="color:${this.colorlist[i]}">Group ${i+1}</dt>
        <dd id="pixeldistribution_${i+1}">0 pixels</dd>
      `));
    }

    // Create Player views
    let userlistView = $(".sidebar#sidebar_left #userlist");
    userlistView.empty()
    for(let i = 0; i < window.state.server.maxgroups; i++){
      for(let j = 0; j < window.state.server.maxusers; j++){
        let userindex = i*window.state.server.maxgroups + j + 1
        userlistView.append($(`
          <dd id="userlist_${userindex}" style="color:${this.colorlist[i]}">Player ${userindex}</dd>
        `));
      }
    }
    $(".sidebar#sidebar_left #userlist .active").removeClass("active");
    let userindex = window.state.server.groupid * window.state.server.maxgroups + window.state.server.userid + 1;
    $(`.sidebar#sidebar_left #userlist #userlist_${userindex}`).addClass("active");

    let gametimer = $(`.sidebar#sidebar_right #gametimer #time`)
    setInterval(function () {
      let currentTime = Date.now() - window.state.server.sessionstarted;
      let remainingTime = window.state.server.sessionduration - currentTime;
      remainingTime /= 1000;

      if (remainingTime < 0) remainingTime = 0;

      let minutes = parseInt(remainingTime / 60, 10);
      let seconds = parseInt(remainingTime % 60, 10);
      minutes = minutes < 10 ?  + minutes : minutes;
      seconds = seconds < 10 ? "0" + seconds : seconds;
      gametimer.text(minutes + ":" + seconds);
    }, 1000);

    setInterval(()=>{
      this.currentDrawPercentage += 10;
      if(!window.state.session.serverarmed){
        document.getElementById('drawPercentage').style.width = `${this.currentDrawPercentage}%`;
      } else {
        document.getElementById('drawPercentage').style.width = `100%`;
      }
    }, (window.state.server.clockspeed/10));
  }
}

export { UIHandler };

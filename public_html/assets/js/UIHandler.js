/*
Purpose: The UIHandler class contains all functions used to set up and adapt the user interface.

Functions:
*/

class UIHandler {
  constructor(){
    this.colorlist = ["#c10000", "#ff9900", "#009600", "#0058ff", "#ffff00", "#ff00ff", "#00ffff"]; // List of usable colors
    this.bgcolor = "#000";
    this.currentDrawPercentage = 0;
    this.piechart;
  }

  fillUI(){
    // Create Player views
    let userlistView = $(".sidebar#sidebar_left #userlist"); //create empty list
    userlistView.empty()
    //Add the current session user
    userlistView.append($(
      `<dd 
        id="userlist_${window.state.server.groupid*window.state.server.maxgroups}" 
        style="color:${this.colorlist[window.state.server.groupid]}">
        <b>
        ${window.state.server.username}
        </b>
      </dd>`
      ));
    //Add the rest of the users of the client's group on top
    for(let i = (window.state.server.groupid*window.state.server.maxgroups); i < ((window.state.server.groupid+1)*window.state.server.maxgroups); i++){
      if(window.state.server.username != window.state.server.userNamesList[i]){
        userlistView.append($(
          `<dd 
            id="userlist_${i}" 
            style="color:${this.colorlist[window.state.server.groupid]}">
            ${window.state.server.userNamesList[i]}
          </dd>`
          ));
      }
    }
    //Add the rest of the users to the list
    for(let groupId = 0; groupId < window.state.server.maxgroups; groupId++){
      for(let userPos = 0; userPos < window.state.server.maxusers; userPos++){
        if(groupId != window.state.server.groupid){
          let userindex = groupId*window.state.server.maxgroups + userPos
          userlistView.append($(`
            <dd id="userlist_${userindex}" style="color:${this.colorlist[groupId]}">${window.state.server.userNamesList[userindex]}</dd>
          `));
        }
      }
    }

    //pie
    var ctxP = document.getElementById("pieChart").getContext('2d');
    this.piechart = new Chart(ctxP, {
      type: 'pie',
      data: {

        datasets: [{
          borderWidth: 0,
          data: [100, 0, 0, 0, 0, 0],
          backgroundColor: ["#FFFFFF", this.colorlist[0], this.colorlist[1], this.colorlist[2], this.colorlist[3]],
          }]
        },
        options: {
          responsive: true,
          events: ['null']
        }
      });

    // Init end-of-game timer
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

    // Init drawpercentagebar timer
    setInterval(()=>{
      this.currentDrawPercentage += 10;
      if(!window.state.session.serverarmed){
        document.getElementById('drawPercentage').style.width = `${this.currentDrawPercentage}%`;
      } else {
        document.getElementById('drawPercentage').style.width = `100%`;
      }
    }, (window.state.server.clockspeed/10));
  }
  changeUser(index,username){
    $(`#userlist_${index}`).fadeOut(500, function() {
      $(this).text(username).fadeIn(500);
    });
  }
  bindKeyListener(){
    document.addEventListener('keyup', (event) => {
      if(!window.state.server.ready){return 0;}
      const keyName = event.key;
      let xOffset = window.state.session.currentXPos - window.state.session.lastPixelPos[0];
      let yOffset = window.state.session.currentYPos - window.state.session.lastPixelPos[1];
      if (keyName === 'ArrowRight') {
        if(xOffset < 1 && window.state.session.currentXPos < window.state.server.maxPixelsWidth - 1){
          window.state.session.currentXPos += 1;
        }
      }
      else if (keyName === 'ArrowLeft') {
        if(xOffset > -1 && window.state.session.currentXPos>0){
          window.state.session.currentXPos -= 1;
        }
      }
      else if (keyName === 'ArrowUp') {
        if(yOffset > -1 && window.state.session.currentYPos>0){
          window.state.session.currentYPos -= 1;
        }
      }
      else if (keyName === 'ArrowDown') {
        if(yOffset < 1 && window.state.session.currentYPos < window.state.server.maxPixelsHeight - 1){
          window.state.session.currentYPos += 1;
        }
      }
      else if (keyName === ' ')  {
        if(window.state.session.serverarmed){
          window.state.session.pixelArray[window.state.session.currentXPos][window.state.session.currentYPos].setGroup(window.state.server.groupid);
          this.sendPixel();
          window.state.session.lastPixelPos[0] = window.state.session.currentXPos;
          window.state.session.lastPixelPos[1] = window.state.session.currentYPos;
          window.state.session.serverarmed = false;
        }
      }
    });
  }
  sendPixel(){
    var rad = Math.atan2(window.state.session.lastPixelPos[1] - window.state.session.currentYPos, window.state.session.currentXPos - window.state.session.lastPixelPos[0]);
    var deg = rad * (180 / Math.PI);
    let sendable = {
      mouseX:window.state.session.currentXPos,
      mouseY:window.state.session.currentYPos,
      degrees:deg,
      clock:window.state.session.clock,
    }
    if(window.state.server.ready)window.socketHandler.emit('drawpixel', sendable);
    else console.error("Socket undefined")
  }
  onClock(){
    window.uiHandler.currentDrawPercentage = 0;
    this.calcPixelDistribution();
  }
  updateUserGroup(){
    $(".sidebar#sidebar_left #userlist .active").removeClass("active");
    let userindex = window.state.server.groupid * window.state.server.maxgroups + window.state.server.userid + 1;
    $(`.sidebar#sidebar_left #userlist #userlist_${userindex}`).addClass("active");
    if(typeof window.audioclass != "undefined"){
      window.audioclass.setGroupID(window.state.server.groupid);
    }
  }
  calcPixelDistribution(){
    let distribution = new Array(window.state.server.maxgroups+1).fill(0);
    let maxPixels = window.state.server.maxPixelsWidth*window.state.server.maxPixelsHeight;
    for(let col of window.state.session.pixelArray){
      for(let row of col){
        distribution[row.group+1]++;
      }
    }
    if(this.piechart !== undefined){
      this.piechart.data.datasets.forEach((dataset) => {
          dataset.data = [];
      });
      this.piechart.data.datasets.forEach((dataset) => {
        for (let groupindex in distribution){
          let value = distribution[groupindex];
          let percentage = (value/maxPixels*100).toFixed(2);
          dataset.data.push(percentage);
        }
      });
      this.piechart.update();
    }
    for(let groupindex in distribution){
      let value = distribution[groupindex];
      let percentage = (value/maxPixels*100).toFixed(2);;
      $(".sidebar#sidebar_right #pixeldistribution #pixeldistribution_"+groupindex)
        .text(`${value} pixels, ${percentage}%`)
    }
  }
}

export { UIHandler };

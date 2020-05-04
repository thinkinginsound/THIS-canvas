import { EndModal } from  "./modals/endModal.js"

const container = window.document.getElementById('container'); // Get container in which p5js will run
let testSheepArray = [0, 1, 1, 0, 1, 1, 0, 0, 1, 0]; //aanpassen naar variabel

const colorlist = ["#c10000", "#ff9900", "#009600", "#0058ff", "#ffff00", "#ff00ff", "#00ffff"]; // List of usable colors
const bgcolor = "#000";
let padding = 20;
let currentDrawPercentage = 0;

let sketch = function(p) {
  let eventHandlerAdded = false
  let pixelSize = 50;

  let offsetX = 0;
  let offsetY = 0;
  calcPixelSize();

  p.setup = function(){
    p.getAudioContext().suspend();
    // Create canvas with the size of the container and fill with bgcolor
    p.createCanvas(container.offsetWidth, container.offsetHeight);
    if(!eventHandlerAdded)document.addEventListener('keyup', function(event) {
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
          window.state.session.pixelArray[window.state.session.currentXPos][window.state.session.currentYPos] = window.state.server.groupid;
          sendPixel();
          window.state.session.lastPixelPos[0] = window.state.session.currentXPos;
          window.state.session.lastPixelPos[1] = window.state.session.currentYPos;
          window.state.session.serverarmed = false;
        }
      }
    });
    eventHandlerAdded = true;
    p.background(bgcolor);
    calcSheepBehavior(testSheepArray);
    // console.log(sheepPercentage);
  }

  p.draw = function() {
    // Don't draw if server is not ready yet
    p.background(bgcolor);
    p.fill("white")
    let canvasWidth = pixelSize*window.state.server.maxPixelsWidth;
    let canvasHeight = pixelSize*window.state.server.maxPixelsHeight;
    p.rect(offsetX, offsetY, canvasWidth , canvasHeight)
    if(!window.state.server.ready)return;
    placePixels();
    previewPixel();
    // ---------------------------- Server Armed ---------------------------- //
  };
  p.windowResized = function() {
    p.resizeCanvas(container.offsetWidth, container.offsetHeight);
    calcPixelSize();
  }

  // Handle mouse click events. Set 'MOUSEARMED' to true if mouse clicked, and false on mouse release OR end of draw function
  p.mousePressed = function() {
    p.userStartAudio();
  }

  function placePixels() {
    // Create square with pixelSize width
    for(let xPos in window.state.session.pixelArray){
      for(let yPos in window.state.session.pixelArray[xPos]){
        if(window.state.session.pixelArray[xPos][yPos]==-1)continue;
        let pixelcolor = colorlist[window.state.session.pixelArray[xPos][yPos]];
        p.fill(pixelcolor);
        p.stroke(pixelcolor);
        p.rect(offsetX+xPos*pixelSize, offsetY+yPos*pixelSize, pixelSize, pixelSize);
      }
    }
  }

  function previewPixel() {
    let strokeWeight = pixelSize/20;
    p.noFill();
    p.strokeWeight(strokeWeight);
    p.stroke(0);
    p.rect(offsetX + window.state.session.currentXPos*pixelSize - strokeWeight/2, offsetY + window.state.session.currentYPos*pixelSize - strokeWeight/2, pixelSize, pixelSize);

  }

  function sendPixel(){
    var rad = Math.atan2(window.state.session.lastPixelPos[1] - window.state.session.currentYPos, window.state.session.currentXPos - window.state.session.lastPixelPos[0]);
    var deg = rad * (180 / Math.PI);
    let sendable = {
      mouseX:window.state.session.currentXPos,
      mouseY:window.state.session.currentYPos,
      degrees:deg,
      clock:window.state.session.clock,
    }
    if(window.state.server.ready)socket.emit('drawpixel', sendable);
    else console.error("Socket undefined")
  }

  function calcPixelSize(){
    if(container.offsetWidth/window.state.server.maxPixelsWidth < container.offsetHeight/window.state.server.maxPixelsHeight){
      pixelSize = (container.offsetWidth - 2*padding)/window.state.server.maxPixelsWidth;
    } else {
      pixelSize = (container.offsetHeight - 2*padding)/window.state.server.maxPixelsHeight;
    }

    if(container.offsetWidth/window.state.server.maxPixelsWidth < container.offsetHeight/window.state.server.maxPixelsHeight){ // Portrait
      offsetY = padding + container.offsetHeight/2 - (window.state.server.maxPixelsHeight/2)*pixelSize;
      offsetX = padding;
    } else { // Landscape
      offsetX = padding + container.offsetWidth/2 - (window.state.server.maxPixelsWidth/2)*pixelSize;
      offsetY = padding;
    }
    return pixelSize;
  }

  function calcSheepBehavior(sheepArray){
    let arrAvg = sheepArray => sheepArray.reduce((a,b) => a + b, 0) / sheepArray.length;
    window.state.session.sheepPercentage = arrAvg(sheepArray)*100;
    document.getElementById("sheepPercentage");
    return window.state.session.sheepPercentage;
  }
};

new p5(sketch, container);

let socketInitalizedPromise = new Promise( (res, rej) => {
  let counter = 0;
  setInterval(()=>{
    if(typeof socket!="undefined") res();
    else if(++counter>10)rej()
  }, 500);
}).then(function(){
  window.state.server.ready = true;
  socket.emit("ready", "", function(response){
    window.state.server.sessionkey = response.sessionkey;
    window.state.server.groupid = response.groupid;
    window.state.server.userid = response.userindex;
    window.state.server.maxgroups = response.maxgroups;
    window.state.server.maxusers = response.maxusers;
    window.state.server.maxPixelsWidth = response.canvaswidth;
    window.state.server.maxPixelsHeight = response.canvasheight;
    window.state.server.clockspeed = response.clockspeed;
    window.state.server.sessionduration = response.sessionduration;

    window.state.session.currentXPos = randomInt(window.state.server.maxPixelsWidth); //random x position in canvas
    window.state.session.currentYPos = randomInt(window.state.server.maxPixelsHeight); // random y positon in canvas
    window.state.session.herdingstatus = createArray(window.state.server.maxgroups, window.state.server.maxusers, 0);
    window.state.session.pixelArray = createArray(window.state.server.maxPixelsWidth, window.state.server.maxPixelsHeight, -1);
    window.state.session.lastPixelPos = [window.state.session.currentXPos, window.state.session.currentYPos];

    if(typeof window.audioclass != "undefined"){
      window.audioclass.setGroupID(window.state.server.groupid);
    }

    // Create distribution views
    let pixeldistributionView = $(".sidebar#sidebar_right #pixeldistribution");
    pixeldistributionView.empty()
    pixeldistributionView.append($(`
      <dt>Free</dt>
      <dd id="pixeldistribution_0">0 pixels</dd>
    `));
    for(let i = 0; i < window.state.server.maxgroups; i++){
      pixeldistributionView.append($(`
        <dt style="color:${colorlist[i]}">Group ${i+1}</dt>
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
          <dd id="userlist_${userindex}" style="color:${colorlist[i]}">Player ${userindex}</dd>
        `));
      }
    }
    $(".sidebar#sidebar_left #userlist .active").removeClass("active");
    let userindex = window.state.server.groupid * window.state.server.maxgroups + window.state.server.userid + 1;
    $(`.sidebar#sidebar_left #userlist #userlist_${userindex}`).addClass("active");

    let gametimer = $(`.sidebar#sidebar_right #gametimer #time`)
    let startTime = response.sessionstarted;
    setInterval(function () {
      let currentTime = Date.now() - startTime;
      let remainingTime = window.state.server.sessionduration - currentTime;
      remainingTime /= 1000;

      if (remainingTime < 0) remainingTime = 0;

      let minutes = parseInt(remainingTime / 60, 10);
      let seconds = parseInt(remainingTime % 60, 10);
      minutes = minutes < 10 ?  + minutes : minutes;
      seconds = seconds < 10 ? "0" + seconds : seconds;
      gametimer.text(minutes + ":" + seconds);
    }, 200);
    // console.log("ready", response)


    setInterval(()=>{
      currentDrawPercentage += 5;
      if(!window.state.session.serverarmed){
        document.getElementById('drawPercentage').style.width = `${currentDrawPercentage}%`;
      } else {
        document.getElementById('drawPercentage').style.width = `100%`;
      }
    }, (window.state.server.clockspeed/20));
  });
  socket.on('clock', (data)=>{
    console.log("clock", data)
    currentDrawPercentage = 0;
    window.state.session.serverarmed = true;
    window.state.session.clock = data
    calcPixelDistribution();
  })
  socket.on('drawpixel', function(data){
    let valueX = Math.floor(data.mouseX);
    let valueY = Math.floor(data.mouseY);

    if(valueX<0)valueX = 0;
    else if(valueX>window.state.server.maxPixelsWidth)valueX = window.state.server.maxPixelsWidth;

    if(valueY<0)valueY = 0;
    else if(valueY>window.state.server.maxPixelsHeight)valueY = window.state.server.maxPixelsHeight;

    window.state.session.pixelArray[valueX][valueY] = parseInt(data.groupid);
  })
  socket.on('herdingStatus', function(data){
    if(window.state.server.groupid == -1 || window.state.server.userid == -1)return;
    window.state.session.isHerding = data[window.state.server.groupid][window.state.server.userid];
    window.state.session.herdingstatus = data;
    window.audioclass.setIsHerding(window.state.session.isHerding);
    console.log("herdingStatus", window.state.session.isHerding);
  })
  socket.on('groupupdate', function(data){
    if(data.indexOf(window.state.server.sessionkey)!=-1){
      window.state.server.groupid = data.groupid;
      window.state.server.userid = data.userindex;
      $(".sidebar#sidebar_left #userlist .active").removeClass("active");
      let userindex = window.state.server.groupid * window.state.server.maxgroups + window.state.server.userid + 1;
      $(`.sidebar#sidebar_left #userlist #userlist_${userindex}`).addClass("active");
      if(typeof window.audioclass != "undefined"){
        window.audioclass.setGroupID(window.state.server.groupid);
      }
    }
    console.log("groupupdate", data);
  })
  socket.on('sessionexpired',function(data){
    let endModal = new EndModal();
    window.state.server.ready = false;
    endModal.setSheepPercentage(window.state.session.sheepPercentage);
    endModal.show();
  });
});

function calcPixelDistribution(){
  let distribution = new Array(window.state.server.maxgroups+1).fill(0);
  let maxPixels = window.state.server.maxPixelsWidth*window.state.server.maxPixelsHeight;
  for(let col of window.state.session.pixelArray){
    for(let row of col){
      distribution[row+1]++;
    }
  }
  for(let groupindex in distribution){
    let value = distribution[groupindex];
    let percentage = (value/maxPixels*100).toFixed(2);;
    $(".sidebar#sidebar_right #pixeldistribution #pixeldistribution_"+groupindex)
      .text(`${value} pixels, ${percentage}%`)
  }
}

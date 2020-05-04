import { AudioClass } from  "./audioclass.js"
import { EndModal } from  "./modals/endModal.js"

const container = window.document.getElementById('container'); // Get container in which p5js will run
let MOUSEARMED = false; // Used to handle a click event only once
let SERVERREADY = false;
let SERVERARMED = true;
let SERVERCLOCK = -1;
let GROUPID = -1;
let USERID = -1;
let MAXGROUPS = 0;
let MAXUSERS = 0;
let SESSIONKEY = -1;
let ISHERDING = false;
let HERDINGSTATUS = []
let CLOCKSPEED = 1000;
let SESSIONDURATION = 1000*60*5; // 5 minutes in ms;
let testSheepArray = [0, 1, 1, 0, 1, 1, 0, 0, 1, 0]; //aanpassen naar variabel
window.sheepPercentage = 0;

const colorlist = ["#c10000", "#ff9900", "#009600", "#0058ff", "#ffff00", "#ff00ff", "#00ffff"]; // List of usable colors
const bgcolor = "#000";
let lastCursor = [null,null,false]; // Last state of cursor (x,y,down)
let maxPixelsWidth = 40;
let maxPixelsHeight = 30;
let pixelArray = createArray(maxPixelsWidth, maxPixelsHeight, -1);
let padding = 20;
let drawPercentage = 20;
let currentDrawPercentage = 0;

let audioClass;

let sketch = function(p) {
  let eventHandlerAdded = false
  let pixelSize = 50;
  let basicNotes = ['C3', 'E3', 'G3']; // noteList if herdBehavior
  let coolNotes = ['C4', 'D4', 'E4', 'F4', 'G4', 'A4', 'B4']; // noteList if no herdBehavior
  let lastNotePlay = 0;
  let noteDuration = 500;
  let monoSynth;
  let currentXPos = randomInt(maxPixelsWidth); //random x position in canvas
  let currentYPos = randomInt(maxPixelsHeight); // random y positon in canvas
  let lastPixelPos = [currentXPos, currentYPos];
  let offsetX = 0;
  let offsetY = 0;
  calcPixelSize();

  // Load audio class with 'p' variable
  audioClass = new AudioClass(p);

  p.setup = function(){
    let endModal = new EndModal();
    SERVERREADY = false;
    endModal.setSheepPercentage(window.sheepPercentage);
    endModal.show();
    p.getAudioContext().suspend();
    // Create canvas with the size of the container and fill with bgcolor
    p.createCanvas(container.offsetWidth, container.offsetHeight);
    //monoSynth = new p5.MonoSynth(); // Creates new monoSynth
    if(!eventHandlerAdded)document.addEventListener('keyup', function(event) {
      if(!SERVERREADY){return 0;}
      const keyName = event.key;
      let xOffset = currentXPos - lastPixelPos[0];
      let yOffset = currentYPos - lastPixelPos[1];
      if (keyName === 'ArrowRight') {
        if(xOffset < 1 && currentXPos < maxPixelsWidth - 1){
          currentXPos += 1;
        }
      }
      else if (keyName === 'ArrowLeft') {
        if(xOffset > -1 && currentXPos>0){
          currentXPos -= 1;
        }
      }
      else if (keyName === 'ArrowUp') {
        if(yOffset > -1 && currentYPos>0){
          currentYPos -= 1;
        }
      }
      else if (keyName === 'ArrowDown') {
        if(yOffset < 1 && currentYPos < maxPixelsHeight - 1){
          currentYPos += 1;
        }
      }
      else if (keyName === ' ')  {
        if(SERVERARMED){
          pixelArray[currentXPos][currentYPos] = GROUPID;
          lastPixelPos[0] = currentXPos;
          lastPixelPos[1] = currentYPos;

          sendPixel();
          SERVERARMED = false;
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
    let canvasWidth = pixelSize*maxPixelsWidth;
    let canvasHeight = pixelSize*maxPixelsHeight;
    p.rect(offsetX, offsetY, canvasWidth , canvasHeight)
    if(!SERVERREADY)return;
    placePixels();
    previewPixel();
    // ---------------------------- Server Armed ---------------------------- //
    // Release mouse if armed
    if(MOUSEARMED) MOUSEARMED = false;
  };
  p.windowResized = function() {
    p.resizeCanvas(container.offsetWidth, container.offsetHeight);
    calcPixelSize();
  }

  // Handle mouse click events. Set 'MOUSEARMED' to true if mouse clicked, and false on mouse release OR end of draw function
  p.mousePressed = function() {
    p.userStartAudio();
    MOUSEARMED = true;
  }
  p.mouseReleased = function() {
    MOUSEARMED = false;
  }

  function placePixels() {
    // Create square with pixelSize width
    for(let xPos in pixelArray){
      for(let yPos in pixelArray[xPos]){
        if(pixelArray[xPos][yPos]==-1)continue;
        let pixelcolor = colorlist[pixelArray[xPos][yPos]];
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
    p.rect(offsetX + currentXPos*pixelSize - strokeWeight/2, offsetY + currentYPos*pixelSize - strokeWeight/2, pixelSize, pixelSize);

  }

  function sendPixel(){
    if(lastCursor[0]==null) lastCursor = [currentXPos, currentYPos, p.mouseIsPressed];
    var rad = Math.atan2(lastCursor[1] - currentYPos, currentXPos - lastCursor[0]);
    var deg = rad * (180 / Math.PI);
    let sendable = {
      mouseX:currentXPos,
      mouseY:currentYPos,
      degrees:deg,
      clock:SERVERCLOCK,
    }
    if(SERVERREADY)socket.emit('drawpixel', sendable);
    else console.error("Socket undefined")
    // Set new position
    lastCursor = [currentXPos, currentYPos, p.mouseIsPressed];
  }

  function calcPixelSize(){
    if(container.offsetWidth/maxPixelsWidth < container.offsetHeight/maxPixelsHeight){
      pixelSize = (container.offsetWidth - 2*padding)/maxPixelsWidth;
    } else {
      pixelSize = (container.offsetHeight - 2*padding)/maxPixelsHeight;
    }

    if(container.offsetWidth/maxPixelsWidth < container.offsetHeight/maxPixelsHeight){ // Portrait
      offsetY = padding + container.offsetHeight/2 - (maxPixelsHeight/2)*pixelSize;
      offsetX = padding;
    } else { // Landscape
      offsetX = padding + container.offsetWidth/2 - (maxPixelsWidth/2)*pixelSize;
      offsetY = padding;
    }
    return pixelSize;
  }

  function calcSheepBehavior(sheepArray){
    let arrAvg = sheepArray => sheepArray.reduce((a,b) => a + b, 0) / sheepArray.length;
    window.sheepPercentage = arrAvg(sheepArray)*100;
    document.getElementById("sheepPercentage");
    return window.sheepPercentage;
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
  SERVERREADY = true;
  socket.emit("ready", "", function(response){
    SESSIONKEY = response.sessionkey;
    GROUPID = response.groupid;
    USERID = response.userindex;
    MAXGROUPS = response.maxgroups;
    MAXUSERS = response.maxusers;
    maxPixelsWidth = response.canvaswidth;
    maxPixelsHeight = response.canvasheight;
    HERDINGSTATUS = createArray(MAXGROUPS, MAXUSERS, 0);
    CLOCKSPEED = response.clockspeed;
    SESSIONDURATION = response.sessionduration;
    if(typeof audioClass != "undefined"){
      audioClass.setGroupID(GROUPID);
    }

    // Create distribution views
    let pixeldistributionView = $(".sidebar#sidebar_right #pixeldistribution");
    pixeldistributionView.empty()
    pixeldistributionView.append($(`
      <dt>Free</dt>
      <dd id="pixeldistribution_0">0 pixels</dd>
    `));
    for(let i = 0; i < MAXGROUPS; i++){
      pixeldistributionView.append($(`
        <dt style="color:${colorlist[i]}">Group ${i+1}</dt>
        <dd id="pixeldistribution_${i+1}">0 pixels</dd>
      `));
    }

    // Create Player views
    let userlistView = $(".sidebar#sidebar_left #userlist");
    userlistView.empty()
    for(let i = 0; i < MAXGROUPS; i++){
      for(let j = 0; j < MAXUSERS; j++){
        let userindex = i*MAXGROUPS + j + 1
        userlistView.append($(`
          <dd id="userlist_${userindex}" style="color:${colorlist[i]}">Player ${userindex}</dd>
        `));
      }
    }
    $(".sidebar#sidebar_left #userlist .active").removeClass("active");
    let userindex = GROUPID*MAXGROUPS + USERID + 1;
    $(`.sidebar#sidebar_left #userlist #userlist_${userindex}`).addClass("active");

    let gametimer = $(`.sidebar#sidebar_right #gametimer #time`)
    let startTime = response.sessionstarted;
    setInterval(function () {
      let currentTime = Date.now() - startTime;
      let remainingTime = SESSIONDURATION - currentTime;
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
      if(!SERVERARMED){
        document.getElementById('drawPercentage').style.width = `${currentDrawPercentage}%`;
      } else {
        document.getElementById('drawPercentage').style.width = `100%`;
      }
    }, (CLOCKSPEED/20));
  });
  socket.on('clock', (data)=>{
    console.log("clock", data)
    currentDrawPercentage = 0;
    SERVERARMED = true;
    SERVERCLOCK = data
    calcPixelDistribution();
  })
  socket.on('drawpixel', function(data){
    let valueX = Math.floor(data.mouseX);
    let valueY = Math.floor(data.mouseY);

    if(valueX<0)valueX = 0;
    else if(valueX>maxPixelsWidth)valueX = maxPixelsWidth;

    if(valueY<0)valueY = 0;
    else if(valueY>maxPixelsHeight)valueY = maxPixelsHeight;

    pixelArray[valueX][valueY] = parseInt(data.groupid);
  })
  socket.on('herdingStatus', function(data){
    if(GROUPID == -1 || USERID == -1)return;
    ISHERDING = data[GROUPID][USERID];
    HERDINGSTATUS = data;
    audioClass.setIsHerding(ISHERDING);
    console.log("herdingStatus", ISHERDING);
  })
  socket.on('groupupdate', function(data){
    if(data.indexOf(SESSIONKEY)!=-1){
      GROUPID = data.groupid;
      USERID = data.userindex;
      $(".sidebar#sidebar_left #userlist .active").removeClass("active");
      let userindex = GROUPID*MAXGROUPS + USERID + 1;
      $(`.sidebar#sidebar_left #userlist #userlist_${userindex}`).addClass("active");
      if(typeof audioClass != "undefined"){
        audioClass.setGroupID(GROUPID);
      }
    }
    console.log("groupupdate", data);
  })
  socket.on('sessionexpired',function(data){
    let endModal = new EndModal();
    SERVERREADY = false;
    endModal.setSheepPercentage(window.sheepPercentage);
    endModal.show();
  });
});

function calcPixelDistribution(){
  let distribution = new Array(MAXGROUPS+1).fill(0);
  let maxPixels = maxPixelsWidth*maxPixelsHeight;
  for(let col of pixelArray){
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

import { AudioClass } from  "./audioclass.js"

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

const colorlist = ["#6b4098", "#ff9900", "#009600", "#00009f", "#ffff00", "#ff00ff", "#00ffff"]; // List of usable colors
const bgcolor = "#000";
let lastCursor = [null,null,false]; // Last state of cursor (x,y,down)
let maxPixelsWidth = 40;
let maxPixelsHeight = 30;
let pixelArray = createArray(maxPixelsWidth, maxPixelsHeight, -1);
let padding = 20;
let drawPercentage = 20;

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
    p.getAudioContext().suspend();
    // Create canvas with the size of the container and fill with bgcolor
    p.createCanvas(container.offsetWidth, container.offsetHeight);
    //monoSynth = new p5.MonoSynth(); // Creates new monoSynth
    if(!eventHandlerAdded)document.addEventListener('keyup', function(event) {
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

    // -------------------------------- Sound ------------------------------- //
    if (p.millis()-lastNotePlay>noteDuration){
      if (ISHERDING) {
        playSynth(coolNotes); // If user doesn't show herdBehavior, play "coolNotes"
      }
      else {
        playSynth(basicNotes); // If user does show herdBehavior, play "basicNotes"
      }
      lastNotePlay = p.millis();
    }

    // ---------------------------- Server Armed ---------------------------- //
    if(SERVERARMED) {
      setInterval(()=>{
        document.getElementById("drawPercentage");
        //verstuur +10 naar index
      }, (CLOCKSPEED/10));
    }
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

  function playSynth(notelist) {
    p.userStartAudio();

    let note = p.random(notelist);
    // note velocity (volume, from 0 to 1)
    let velocity = p.random(0.1, 0.4);
    // time from now (in seconds)
    let time = 0;
    // note duration (in seconds)
    let dur = 0;
    //monoSynth.setADSR(1, 0.3, 0.5, 1);
    //monoSynth.play(note, velocity, time, dur);
  }

  function sendPixel(){
    if(lastCursor[0]==null) lastCursor = [currentXPos, currentYPos, p.mouseIsPressed];
    let distance = p.dist(lastCursor[0], lastCursor[1], currentXPos, currentYPos)
    var rad = Math.atan2(lastCursor[1] - currentYPos, currentXPos - lastCursor[0]);
    var deg = rad * (180 / Math.PI);
    let sendable = {
      mouseX:currentXPos/maxPixelsWidth,
      mouseY:currentYPos/maxPixelsHeight,
      degrees:deg,
      distance:distance,
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
    let startTime = Date.now();
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
    console.log("ready", response)
  });
  socket.on('clock', (data)=>{
    SERVERARMED = true;
    SERVERCLOCK = data
    calcPixelDistribution();
  })
  socket.on('drawpixel', function(data){
    pixelArray[data.mouseX*maxPixelsWidth][data.mouseY*maxPixelsHeight] = parseInt(data.groupid);
  })
  socket.on('herdingStatus', function(data){
    if(GROUPID == -1 || USERID == -1)return
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

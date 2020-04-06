const container = window.document.getElementById('container'); // Get container in which p5js will run
let MOUSEARMED = false; // Used to handle a click event only once
let SERVERREADY = false;
let SERVERARMED = true;
let SERVERCLOCK = -1;
let GROUPID = -1;

const colorlist = ["#6b4098", "#c10000", "#009600", "#00009f", "#ffff00", "#ff00ff", "#00ffff"]; // List of usable colors
const bgcolor = "#f0f0f0";
let lastCursor = [null,null,false]; // Last state of cursor (x,y,down)
let pixels = [];
let sketch = function(p) {
  let pixelSize = Math.floor(container.offsetWidth/40);
  let basicNotes = ['C3', 'E3', 'G3']; // noteList if herdBehavior
  let coolNotes = ['C4', 'D4', 'E4', 'F4', 'G4', 'A4', 'B4']; // noteList if no herdBehavior
  let lastNotePlay = 0;
  let noteDuration = 500;
  let hipsterBehavior = false; // variable we need from AI.
  let monoSynth;
  let currentXPos = Math.floor(p.random(0,(Math.floor(container.offsetWidth/pixelSize)))) * pixelSize; //random x position in canvas
  let currentYPos = Math.floor(p.random(0,(Math.floor(container.offsetHeight/pixelSize)))) * pixelSize; // random y positon in canvas
  let spacePressed = false;
  let arrowRight = false;
  let arrowLeft = false;
  let arrowUp = false;
  let arrowDown = false;
  let moved = false;
  let currentPos = [currentXPos, currentYPos];


  p.setup = function(){
    // Create canvas with the size of the container and fill with bgcolor
    p.createCanvas(container.offsetWidth, container.offsetHeight);
    monoSynth = new p5.MonoSynth(); // Creates new monoSynth
    document.addEventListener('keyup', function(event) {
      const keyName = event.key;
      if (keyName === 'ArrowRight') {
        if (currentPos[0] <= currentXPos || currentPos[0]+pixelSize == currentXPos){
          currentXPos+=pixelSize;
        }
      }
      else if (keyName === 'ArrowLeft') {
        if (arrowLeft == false){
          currentXPos-=pixelSize;
        }
        arrowLeft = true
      }
      else if (keyName === 'ArrowUp')  {
        if (arrowUp == false){
          currentYPos-=pixelSize;
        }
        arrowUp = true
      }
      else if (keyName === 'ArrowDown')  {
        if (arrowDown == false){
          currentYPos+=pixelSize;
        }
        arrowDown = true
      }
      else if (keyName === ' ')  {
        spacePressed = true;
        if(SERVERARMED){
          pixels.push({
            xPos:currentXPos/p.width,
            yPos:currentYPos/p.width,
            groupid:GROUPID
          });
          arrowRight = false;
          arrowLeft = false;
          arrowUp = false;
          arrowDown = false;
          currentPos[0] = currentXPos;

          sendPixel();
          SERVERARMED = false;
        }
      }
      console.log(currentXPos, currentYPos);
    });
    p.background(bgcolor);
  }

  p.draw = function() {
    p.background(bgcolor);
    if(!SERVERREADY)return;
    placePixels();
    previewPixel();

    if(MOUSEARMED == true) {
      //placePixel(); // Call drawing function if mouse is clicked
    }

    if (currentXPos<0) {
      currentXPos = 0;
    }
    if (currentXPos>container.offsetWidth) {
      currentXPos -= pixelSize;
    }
    if (currentYPos<0) {
      currentYPos = 0;
    }
    if (currentYPos>container.offsetHeight) {
      currentYPos -= pixelSize;
    }


    if (p.millis()-lastNotePlay>noteDuration){
      if (hipsterBehavior == true) {
        playSynth(coolNotes); // If user doesn't show herdBehavior, play "coolNotes"
      }
      else {
        playSynth(basicNotes); // If user does show herdBehavior, play "basicNotes"
      }
      lastNotePlay = p.millis();
    }

    p.fill(SERVERARMED?"green":"red");
    p.noStroke();
    p.rect(10,10,50,50);

    // Release mouse if armed
    if(MOUSEARMED) MOUSEARMED = false;
  };
  p.windowResized = function() {
    p.resizeCanvas(container.offsetWidth, container.offsetWidth);
    let prevPixelSize = pixelSize;
    pixelSize = Math.floor(container.offsetWidth/40);
    currentXPos = (currentXPos / prevPixelSize) * pixelSize;
  }

  // Handle mouse click events. Set 'MOUSEARMED' to true if mouse clicked, and false on mouse release OR end of draw function
  p.mousePressed = function() {
    MOUSEARMED = true;
  }
  p.mouseReleased = function() {
    MOUSEARMED = false;
  }

  function placePixels() {
    console.log(currentXPos);
    console.log(currentPos[0]);
    // Create square with pixelSize width
    for (len = pixels.length, i=0; i<len; ++i) {
      let xPos = pixels[i].xPos*p.width;
      let yPos = pixels[i].yPos*p.width;
      let pixelcolor = colorlist[pixels[i].groupid]
      p.fill(pixelcolor);
      p.stroke(pixelcolor);
      p.rect(xPos, yPos, pixelSize, pixelSize);
    }
  }

  function previewPixel() {
    p.noFill();
    p.strokeWeight(pixelSize/20);
    p.stroke(0);
    p.rect(currentXPos, currentYPos, pixelSize, pixelSize);

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
    monoSynth.setADSR(1, 0.3, 0.5, 1);
    monoSynth.play(note, velocity, time, dur);
  }

  function sendPixel(){
    if(lastCursor[0]==null) lastCursor = [currentXPos, currentYPos, p.mouseIsPressed];
    let distance = p.dist(lastCursor[0], lastCursor[1], currentXPos, currentYPos)
    var rad = Math.atan2(lastCursor[1] - currentYPos, currentXPos - lastCursor[0]);
    var deg = rad * (180 / Math.PI);
    let sendable = {
      mouseX:currentXPos/p.width,
      mouseY:currentYPos/p.width,
      degrees:deg,
      distance:distance,
      clock:SERVERCLOCK,
    }
    if(SERVERREADY)socket.emit('drawpixel', sendable);
    else console.error("Socket undefined")
    // Set new position
    lastCursor = [currentXPos, currentYPos, p.mouseIsPressed];
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
  socket.emit("ready");
  socket.on('clock', (data)=>{
    SERVERARMED = true;
    SERVERCLOCK = data
    // console.log("clock", data)
  })
  socket.on('groupid', (data)=>{
    GROUPID = data;
    console.log("groupid", data)
  })
  socket.on('drawpixel', function(data){
    console.log("drawpixel", data)
    pixels.push({
      xPos:data.mouseX,
      yPos:data.mouseY,
      groupid:data.groupid
    });
  })
});

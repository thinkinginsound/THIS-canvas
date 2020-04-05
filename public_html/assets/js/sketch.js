var socket = io(); // start connection with server via socket.io
const container = window.document.getElementById('container'); // Get container in which p5js will run
let MOUSEARMED = false; // Used to handle a click event only once
let MOUSECLICK = false;

const colorlist = ["#6b4098", "#c10000", "#009600", "#00009f", "#ffff00", "#ff00ff", "#00ffff"]; // List of usable colors
let givenColor = 3; //TODO: @Jochem: de '3' moet vervangen worden door de input van de AI
let chosenColor = colorlist[givenColor]; // givenColor from the AI (0 black, 1 red, 2 green of 3 blue)
const bgcolor = "#f0f0f0";
const maxLineSegs = 1024; // Maximum amount of line segments for every possible user
let linelist = []; // Holder for line segments
let lastCursor = [0,0]; // Last position of cursor (x,y pixels)
let isDrawing = false;


let sketch = function(p) {
  let pixelColor = chosenColor;
  let pixelSize = Math.floor(container.offsetWidth/40);
  let basicNotes = ['C3', 'E3', 'G3']; // noteList if herdBehavior
  let coolNotes = ['C4', 'D4', 'E4', 'F4', 'G4', 'A4', 'B4']; // noteList if no herdBehavior
  let lastNotePlay = 0;
  let noteDuration = 500;
  let hipsterBehavior = false; // variable we need from AI
  let monoSynth;
  let xCords = [];
  let yCords = [];
  let xPos = 0;
  let yPos = 0;
  let currentXPos = Math.floor(p.random(0,(Math.floor(container.offsetWidth/pixelSize)))) * pixelSize; //random x position in canvas
  let currentYPos = Math.floor(p.random(0,(Math.floor(container.offsetHeight/pixelSize)))) * pixelSize; // random y positon in canvas
  let spacePressed = false;
  let arrowRight = false;
  let arrowLeft = false;
  let arrowUp = false;
  let arrowDown = false;
  let SERVERARMED = true;
  let moved = false;


  p.setup = function(){
    // Create canvas with the size of the container and fill with bgcolor
    p.createCanvas(container.offsetWidth, container.offsetHeight);
    monoSynth = new p5.MonoSynth(); // Creates new monoSynth

    document.addEventListener('keyup', function(event) {
      const keyName = event.key;
      if (keyName === 'ArrowRight') {
        if (arrowRight == false){
          currentXPos+=pixelSize;
        }
        arrowRight = true;
      } else if (keyName === 'ArrowLeft') {
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
          if (SERVERARMED){
            xCords.push(currentXPos);
            yCords.push(currentYPos);
            arrowRight = false;
            arrowLeft = false;
            arrowUp = false;
            arrowDown = false;
          }
        }
        console.log(currentXPos, currentYPos);
    });
  }

  p.draw = function() {
    p.background(bgcolor);
    placePixels();
    previewPixel();

    if(MOUSEARMED == true) {
      //placePixel(); // Call drawing function if mouse is clicked
    }

    if(MOUSEARMED) MOUSEARMED = false;

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
  }

  p.windowResized = function() {
    p.resizeCanvas(container.offsetWidth, container.offsetWidth);
  }

  // Handle mouse click events. Set 'MOUSEARMED' to true if mouse clicked, and false on mouse release OR end of draw function
  p.mousePressed = function() {
    MOUSEARMED = true;
  }
  p.mouseReleased = function() {
    MOUSEARMED = false;
  }


  function placePixels() {
    // Create square with pixelSize width
    for (len = xCords.length, i=0; i<len; ++i) {
      xPos = xCords[i];
      yPos = yCords[i];
      p.fill(pixelColor);
      p.stroke(pixelColor);
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

  function drawColorChooser(){
    let padding = 10;
    let itmWidth = 50;
    if(p.width <= 500){
      // If canvasWidth <= 500 px then change view to a smaller layout
      itmWidth = p.width/colorlist.length;
      padding = 0;
    }

    let xPos = padding; // Holder for current x position
    for (let colorValue of colorlist) { // For every value in colorlist
      let m = (chosenColor == colorValue)?1.4:1; // Multiplie height if chosen color
      p.fill(colorValue);
      p.stroke(150)
      p.rect(xPos, padding, itmWidth, 50*m);
      if( // Handle click for color chooser
        MOUSEARMED &&
        (p.mouseX>=xPos && p.mouseX<=xPos+itmWidth) &&
        (p.mouseY>=padding && p.mouseY<=50*m)
      ){
        chosenColor = colorValue;
        MOUSEARMED = false;
      }
      xPos += padding + itmWidth;
    }
  }
  function drawCursor(){
    // Only draw cursor if mouse is drawing
    if(p.mouseIsPressed){
      p.fill(pixelColor);
      p.rect((p.mouseX-10), (p.mouseY-10), 20, 20);
    }
  }
  function handleMouseDrawing(){
    // Check if mouse is or is supposed to be drawing.
    if(p.mouseIsPressed && !isDrawing){
      // Mouse is pressed, but not drawing. Changing state and set cursor position
      isDrawing = true;
      lastCursor = [p.mouseX, p.mouseY];
    } else if(p.mouseIsPressed && isDrawing){
      // Mouse is pressed and drawing.
      // Check if moved distance is larger than 'n' pixels. If true add line segment to list and send to socket.io
      if(p.dist(lastCursor[0], lastCursor[1], p.mouseX, p.mouseY) > 10){
        var w = container.offsetWidth;
        var h = container.offsetWidth;
        // Convert mouse position to decimal value.
        socket.emit('drawing', {
          color:chosenColor,
          x0:lastCursor[0] / w,
          y0:lastCursor[1] / h,
          x1:p.mouseX / w,
          y1:p.mouseY / h
        });
        addToLineList(
          chosenColor,
          lastCursor[0],
          lastCursor[1],
          p.mouseX,
          p.mouseY
        )
        // Set last cursor position to current
        lastCursor = [p.mouseX, p.mouseY]
      }
    } else {
      // Else set drawing state false
      isDrawing = false;
    }
  }
  function drawLineSegments(){
    // Draw all line segments
    for(lineSeg of linelist){
      p.push();
      p.fill(lineSeg.color);
      p.stroke(lineSeg.color)
      p.strokeWeight(5)
      p.line(lineSeg.x0, lineSeg.y0, lineSeg.x1, lineSeg.y1)
      p.pop()
    }
  }

};
new p5(sketch, container);
socket.on('drawing', (data)=>{
  // On receive of 'drawing' event: add multiply data with screen size and add data to line list
  var w = container.offsetWidth;
  var h = container.offsetWidth;
  addToLineList(
    data.color,
    data.x0 * w,
    data.y0 * h,
    data.x1 * w,
    data.y1 * h
  )
});

function addToLineList(color, x0, y0, x1, y1){
  // Create line segment object
  let lineSeg = {
    color: color,
    x0: x0,
    y0: y0,
    x1: x1,
    y1: y1
  }
  // check length of linelist and remove first if too long
  if(linelist.length>maxLineSegs)linelist.shift()
  // Add segment to list
  linelist.push(lineSeg);
}

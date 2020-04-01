var socket = io(); // start connection with server via socket.io
const container = window.document.getElementById('container'); // Get container in which p5js will run
let MOUSEARMED = false; // Used to handle a click event only once
let MOUSECLICK = false;

const colorlist = ["#000000", "#ff0000", "#00ff00", "#0000ff", "#ffff00", "#ff00ff", "#00ffff"]; // List of usable colors
let chosenColor = "#000000"; // Chosen color
const bgcolor = "#f0f0f0";
const maxLineSegs = 1024; // Maximum amount of line segments for every possible user
let linelist = []; // Holder for line segments
let lastCursor = [0,0]; // Last position of cursor (x,y pixels)
let isDrawing = false;


let sketch = function(p) {
  let pixelColor = p.color(80, 50, 120);
  let pixelSize = 20;
  p.setup = function(){
    // Create canvas with the size of the container and fill with bgcolor
    p.createCanvas(container.offsetWidth, container.offsetHeight);
    p.background(bgcolor);
  }
  p.draw = function() {
    //handleMouseDrawing()
    //drawLineSegments();
    //drawColorChooser();
    //drawCursor();
    // Release mouse if armed
    if(MOUSEARMED == true) {
      placePixel();
    }
    else {
      displayPixel();
    }
    if(MOUSEARMED) MOUSEARMED = false;
    //if(MOUSECLICK) MOUSECLICK = false;
  };
  p.windowResized = function() {
    p.resizeCanvas(container.offsetWidth, container.offsetWidth);
  }

  // Handle mouse click events. Set 'MOUSEARMED' to true if mouse clicked, and false on mouse release OR end of draw function
  p.mousePressed = function() {
    MOUSEARMED = true;
  }
  p.mouseReleased = function() {
    MOUSEARMED = false;
    MOUSECLICK = false;
  }

  p.mouseClicked = function() {
    MOUSECLICK = true;
  }

  function placePixel() {
    xPos = p.mouseX-pixelSize/2;
    yPos = p.mouseY-pixelSize/2;
    p.fill(pixelColor);
    p.noStroke();
    p.rect(xPos, yPos, pixelSize, pixelSize);
  }

  function displayPixel() {
    let cursorColor = p.color(20, 50, 20);
    p.fill(cursorColor);
    p.noStroke()
    p.rect((p.mouseX-pixelSize/2), (p.mouseY-pixelSize/2), pixelSize, pixelSize);
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

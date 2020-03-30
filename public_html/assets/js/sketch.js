var socket = io();

const container = window.document.getElementById('container');
const colorlist = ["#000000", "#ff0000", "#00ff00", "#0000ff"];
// , "#ffff00", "#ff00ff", "#00ffff" (evt. extra kleuren)
const bgcolor = 250;
const maxLineSegs = 1024;

let linelist = [];
let MOUSEARMED = false;
let chosenColor = "#000000";
let isDrawing = false;
let lastCursor = [0,0];

let sketch = function(p) {
  p.setup = function(){
    p.createCanvas(container.offsetWidth, container.offsetHeight);
    p.background(bgcolor);
  }
  p.draw = function() {
    p.background(bgcolor);
    handleMouseDrawing()
    drawLineSegments();
    drawColorChooser();
    drawCursor();
    // Release mouse armed
    if(MOUSEARMED) MOUSEARMED = false;
  };
  p.windowResized = function() {
    p.resizeCanvas(container.offsetWidth, container.offsetWidth);
  }
  p.mousePressed = function() {
    MOUSEARMED = true;
  }
  p.mouseReleased = function() {
    MOUSEARMED = false;
  }
  function drawColorChooser(){
    // Draw color choosers
    let padding = 10;
    let itmWidth = 50;
    if(p.width <= 500){
      itmWidth = p.width/colorlist.length;
      padding = 0;
    }
    let xPos = padding;
    for (let colorValue of colorlist) {
      let m = (chosenColor == colorValue)?1.4:1; // Multiplier
      p.fill(colorValue);
      p.stroke(150)
      p.rect(xPos, padding, itmWidth, 50*m);
      if(
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
    if(p.mouseIsPressed){
      p.fill(chosenColor);
      p.ellipse(p.mouseX, p.mouseY, 20, 20);
    }
  }
  function handleMouseDrawing(){
    if(p.mouseIsPressed && !isDrawing){
      isDrawing = true;
      lastCursor = [p.mouseX, p.mouseY];
    } else if(p.mouseIsPressed && isDrawing){
      if(p.dist(lastCursor[0], lastCursor[1], p.mouseX, p.mouseY) > 10){
        var w = container.offsetWidth;
        var h = container.offsetWidth;
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
        lastCursor = [p.mouseX, p.mouseY]
      }
    } else {
      isDrawing = false;
    }
  }
  function drawLineSegments(){
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
  let lineSeg = {
    color: color,
    x0: x0,
    y0: y0,
    x1: x1,
    y1: y1
  }
  if(linelist.length>maxLineSegs)linelist.shift()
  linelist.push(lineSeg);
}

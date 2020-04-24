class defaultNPC {
  constructor(canvaswidth, canvasheight, startX, startY){
    this.type = "normalUser"
    this.npc = true;
    this.canvaswidth = canvaswidth;
    this.canvasheight = canvasheight;
    this.x = startX;
    this.y = startY;
    this.prevX = this.x;
    this.prevY = this.y;
  }

  move(){
    // Placeholder
  }

  setPosition(x, y){
    this.xPos = x;
    this.yPos = y;
  }
  get xPos(){ return this.x; }
  get yPos(){ return this.y; }
  set xPos(value){
    if(value<0)this.x=0;
    else if(value>this.canvaswidth)this.x=this.canvaswidth;
    else this.x = value;
  }
  set yPos(value){
    if(value<0)this.y=0;
    else if(value>this.canvasheight)this.y=this.canvasheight;
    else this.y = value;
  }

  changeState(npc){
    this.npc = npc
  }
}

module.exports = defaultNPC

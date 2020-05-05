class defaultNPC {
  constructor(canvaswidth, canvasheight, startX, startY, npcID){
    this.type = "normalUser"
    this.npc = true;
    this.npcID = npcID
    this.sessionid = undefined;
    this.canvaswidth = canvaswidth;
    this.canvasheight = canvasheight;
    this.x = startX;
    this.y = startY;
    this.prevX = this.x;
    this.prevY = this.y;
    this.userName;

    this.makeUserName();
    //this.name;
  }

  pickOne(nameList){
  // TODO: not the same as other users (either both or combination)
    let name = nameList[Math.floor(Math.random()*nameList.length)]; // Pick random word from list
    return name;
  }

  makeUserName(){
    let adjectives = [];
    let nouns = [];
    this.userName=[this.pickOne(global.adjectives),this.pickOne(global.nouns)]; // Combine 2 random words from lists
    console.log(this.userName);
  }

  move(){
    //default
  }

  save(groupIndex, userIndex){
    let rad = Math.atan2(this.y - this.prevY, this.prevX - this.x);
    let deg = (rad * (180 / Math.PI) + 180) % 360;
    let sendable = {
      sessionkey: this.sessionID,
      mouseX: this.x,
      mouseY: this.y,
      degrees: deg,
      groupid: groupIndex,
      clock: global.clockCounter
    }
    global.herdingQueue[groupIndex][global.frameamount-1][userIndex] = deg;
    io.sockets.emit("drawpixel",sendable);
    dbHandler.insertUserdata(this.sessionID, sendable);
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

  set sessionID(sessionID){
    this.sessionid = sessionID;
  }

  get sessionID(){
    if(this.sessionid === undefined) return this.npcID;
    else return this.sessionid;
  }

  set npcState(npc){
    this.npc = npc
  }

  get npcState(){
    return this.npc;
  }
}

module.exports = defaultNPC

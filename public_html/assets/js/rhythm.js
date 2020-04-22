class rhythmClass{
  constructor(p){
    this.p = p;
    this.speed = 1000;
    this.fourbeatList = [1, 0, 0, 0, 1, 0, 0, 0, 1, 0, 0, 0];
    this.threebeatList = [1, 0, 0, 1, 0, 0, 1, 0, 0, 1, 0, 0];
    this.voorkomkans = 80;
  }
  //------------Functions -----------------//
  fourbeatAlg(chance){
    var x = Math.round(Math.random());
    //console.log(x);
    //this.fourbeatList[0]
  }

  threebeatAlg(chance){

  }
}

setInterval(()=>{
  // Uitvoer ding
  fourbeatAlg();
  // 'p.' is nu 'this.p.'
}, this.speed)

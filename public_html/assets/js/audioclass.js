class AudioClass{
  constructor(p){
    // Init variables
    console.log("AudioClass started")
    this.p = p;
    this.groupid = -1;
    this.isHerding = false;
    this.speed = 500;
    // Nieuwe variabelen. Begin met 'this.'

    // Start audio
    this.initAudioEngine();
  }

  // Set data vanuit buiten de class
  setGroupID(groupid){
    console.log("set groupID", groupid);
    this.groupid = groupid
  }
  setIsHerding(isHerding){
    this.isHerding = isHerding
  }

  // Nieuwe functies

  // Functie voor audio engine
  initAudioEngine(){
    setInterval(()=>{
      // Uitvoer ding
      // 'p.' is nu 'this.p.'
    }, this.speed)
  }
}

// Afblijven
export { AudioClass };

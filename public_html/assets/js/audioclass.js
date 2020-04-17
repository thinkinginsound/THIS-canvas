import { Synthesizer } from "./synthesizer.js"

class AudioClass{
  constructor(p){
    // Init variables
    console.log("AudioClass started")
    this.p = p;
    this.groupid = -1;
    this.isHerding = false;
    this.speed = 1000;
    // Nieuwe variabelen. Begin met 'this.'
    this.baseChord = [60, 64, 70];
    this.currentChord = this.baseChord; // pakt nu frequenties inplaats van midi nootnummers
    this.prevChord = [-1,-1,-1];
    // GEBRUIK de lijst this.currentChord om constant te spelen!
    // Start audio
    this.initAudioEngine();
    this.randomPercentage = 0;
    this.moved = false; // Zegt of er een noot in het akkoord veranderd is
    this.counter = 0;
    this.newStart = false;
    this.synthesizer = new Synthesizer("saw",440,1);
  }

  //TODO:Make starter chord available
  playNotesSynth(){
    let sortedPrev = this.prevChord.slice();
    let sortedNew = this.currentChord.slice();
    sortedPrev.sort((a, b) => a - b);
    sortedNew.sort((a, b) => a - b);
    if(sortedPrev[2] >= sortedPrev[0]+18){
      sortedPrev[2] = sortedPrev[0]+18;
    }
    if(sortedNew[2] >= sortedNew[0]+18){
      sortedNew[2] = sortedNew[0]+18;
    }
    let chordToPlay = [];
    let chordToNotPlay = [];
    let push = true;
    sortedNew.forEach((note,indexNote) => {
      sortedPrev.forEach((prevNote) => {
        if(note == prevNote){
          push = false;
          return;
        }
      });
      if(push){
        chordToNotPlay.push(Tone.Frequency(sortedPrev[indexNote], "midi").toNote());
        chordToPlay.push(Tone.Frequency(sortedNew[indexNote], "midi").toNote());
      } else {
        push = true;
      }
    });
    this.synthesizer.noteOff(chordToNotPlay);
    this.synthesizer.noteOn(chordToPlay);
  }

  // Set data vanuit buiten de class
  setGroupID(groupid){
    console.log("set groupID", groupid);
    this.groupid = groupid;
  }

  setIsHerding(isHerding){
    this.isHerding = isHerding;
  }

  // Nieuwe functies

  changeNotes() {
    for (let note in this.currentChord) {
      this.randomPercentage = this.p.round(this.p.random([0], [10])); // getal 1 t/m 10
      if (this.randomPercentage <= 4) {
        // note blijft liggen
        this.moved = false;
      } else if (this.randomPercentage > 4 && this.randomPercentage <= 7) {
        // note gaat omhoog
        if (this.isHerding == true) {
          this.currentChord[note] += 1; // halve toon
        }
        else {
          this.currentChord[note] += 2; // hele toon
        }
        this.moved = true;
      } else {
        // note gaat omlaag
        if (this.isHerding == true) {
          this.currentChord[note] -= 1; // halve toon
        } else {
          this.currentChord[note] -= 2; // hele toon
        }
        this.moved = true;
      }
    }
  }

  newBaseChord() {
    this.prevChord = this.currentChord.slice();
    // Na 5 keer
    if (this.counter >= 5){
      this.randomCounterPercentage = this.p.round(this.p.random([0], [10])); // getal 1 t/m 10
      if (this.randomPercentage <= 7) { // 70% kans om naar het 'grondakkoord' van de reeks te gaan
        //currentChord --> baseChord als minimaal 1 noot overeenkomt
        var note;
        for (note = 0; note in this.currentChord; note++) {
          if (note == this.baseChord[0]) {
            this.newStart = true;
          } else if (note == this.baseChord[1]) {
            this.newStart = true;
          } else if (note == this.baseChord[2]) {
            this.newStart = true;
          }
        }
        if (this.newStart == true) {
          this.currentChord = this.baseChord;
          this.counter = 0;
          this.newStart = false;
        }
      } else { // 30% kans om een nieuw 'grondakkoord' neer te zetten
        //baseChord --> currentChord
        this.baseChord = this.currentChord;
        this.counter = 0;
      }
    }
    this.changeNotes(); //possibly change notes in currentChord

    if (this.moved == false) {
      this.p.random(this.changeNotes());
    }
    if(this.synthesizer != undefined){
      this.playNotesSynth();
    }
    this.counter += 1;
    this.moved = false;
  }

  // Functie voor audio engine
  initAudioEngine(){
    setInterval(()=>{
      // Uitvoer ding
      this.newBaseChord();
      // 'p.' is nu 'this.p.'
    }, this.speed)
  }
}

export { AudioClass };
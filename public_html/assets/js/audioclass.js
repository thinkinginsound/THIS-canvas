import { Synthesizer } from "./synthesizer.js"

class AudioClass{
  constructor(p){
    // Init variables
    console.log("AudioClass started")
    this.p = p;
    this.groupid = -1;
    this.isHerding = false;
    this.speed = 1000;
    this.chord=[60,64,67];
    this.grondtoonIndex=0;
    this.tertsIndex=1;
    this.kwintIndex=2;
    this.chordType="major";

    this.fourbeatList = [1, 0, 0, 0, 1, 0, 0, 0, 1, 0, 0, 0];
    this.threebeatList = [1, 0, 0, 1, 0, 0, 1, 0, 0, 1, 0, 0];
    this.voorkomkans = 5;
    this.chance = 0;
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
// [60, 64, 67];

readChord(chordToRead){
  chordToRead.forEach((element,index)=>{
    chordToRead.forEach((element2,index2)=>{
      if (element2-element==4||element2-element==3||element-element2==8||element-element2==9){
        if (element2-element==4||element-element2==8){
          this.chordType="major"
        }
        if (element2-element==3||element-element2==9){
            this.chordType="minor"
          }
        this.tertsIndex=index2;
        this.grondtoonIndex=index;
        this.kwintIndex=3-index2-index;
      }
    });
  });
}

riemann(){
  let choice = this.p.round(this.p.random(0,2));
  this.readChord(this.chord);
  console.log(this.chord);
  console.log(this.chordType);
  console.log("Grondtoon= ", this.chord[this.grondtoonIndex]);
  console.log("Terts= ", this.chord[this.tertsIndex]);
  console.log("Kwint= ", this.chord[this.kwintIndex]);
  if (choice == 0){
    // Grondtoonverandering
    if(this.chordType == "major"){
      this.chord[this.grondtoonIndex]-=2;
    }
      else{
        this.chord[this.grondtoonIndex]+=2;
      }
  }
  if (choice == 1){
    // Tertsverandering
    if(this.chordType == "major"){
      this.chord[this.tertsIndex]-=1;
    }
      else{
        this.chord[this.tertsIndex]+=1;
      }
  }
  if (choice == 2){
    // Kwintverandering
    if(this.chordType == "major"){
      this.chord[this.kwintIndex]+=2;
    }
      else{
        this.chord[this.kwintIndex]-=2;
      }
  }
}

  //TODO:Make starter chord available
  // playNotesSynth(){
  //   let sortedPrev = this.prevChord.slice();
  //   let sortedNew = this.currentChord.slice();
  //   sortedPrev.sort((a, b) => a - b);
  //   sortedNew.sort((a, b) => a - b);
  //   if(sortedPrev[2] >= sortedPrev[0]+18){
  //     sortedPrev[2] = sortedPrev[0]+18;
  //   }
  //   if(sortedNew[2] >= sortedNew[0]+18){
  //     sortedNew[2] = sortedNew[0]+18;
  //   }
  //   let chordToPlay = [];
  //   let chordToNotPlay = [];
  //   let push = true;
  //   sortedNew.forEach((note,indexNote) => {
  //     sortedPrev.forEach((prevNote) => {
  //       if(note == prevNote){
  //         push = false;
  //         return;
  //       }
  //     });
  //     if(push){
  //       chordToNotPlay.push(Tone.Frequency(sortedPrev[indexNote], "midi").toNote());
  //       chordToPlay.push(Tone.Frequency(sortedNew[indexNote], "midi").toNote());
  //     } else {
  //       push = true;
  //     }
  //   });
  //   this.synthesizer.noteOff(chordToNotPlay);
  //   this.synthesizer.noteOn(chordToPlay);
  // }

  // Set data vanuit buiten de class
  setGroupID(groupid){
    console.log("set groupID", groupid);
    this.groupid = groupid;
  }

  setIsHerding(isHerding){
    this.isHerding = isHerding;
  }

  // Nieuwe functies

  // changeNotes() {
  //   for (let note in this.currentChord) {
  //     this.randomPercentage = this.p.round(this.p.random([0], [10])); // getal 1 t/m 10
  //     if (this.randomPercentage <= 4) {
  //       // note blijft liggen
  //       this.moved = false;
  //     } else if (this.randomPercentage > 4 && this.randomPercentage <= 7) {
  //       // note gaat omhoog
  //       if (this.isHerding == true) {
  //         this.currentChord[note] += 1; // halve toon
  //       }
  //       else {
  //         this.currentChord[note] += 2; // hele toon
  //       }
  //       this.moved = true;
  //     } else {
  //       // note gaat omlaag
  //       if (this.isHerding == true) {
  //         this.currentChord[note] -= 1; // halve toon
  //       } else {
  //         this.currentChord[note] -= 2; // hele toon
  //       }
  //       this.moved = true;
  //     }
  //   }
  // }

  // newBaseChord() {
  //   this.prevChord = this.currentChord.slice();
  //   // Na 5 keer
  //   if (this.counter >= 5){
  //     this.randomCounterPercentage = this.p.round(this.p.random([0], [10])); // getal 1 t/m 10
  //     if (this.randomPercentage <= 7) { // 70% kans om naar het 'grondakkoord' van de reeks te gaan
  //       //currentChord --> baseChord als minimaal 1 noot overeenkomt
  //       var note;
  //       for (note = 0; note in this.currentChord; note++) {
  //         if (note == this.baseChord[0]) {
  //           this.newStart = true;
  //         } else if (note == this.baseChord[1]) {
  //           this.newStart = true;
  //         } else if (note == this.baseChord[2]) {
  //           this.newStart = true;
  //         }
  //       }
  //       if (this.newStart == true) {
  //         this.currentChord = this.baseChord;
  //         this.counter = 0;
  //         this.newStart = false;
  //       }
  //     } else { // 30% kans om een nieuw 'grondakkoord' neer te zetten
  //       //baseChord --> currentChord
  //       this.baseChord = this.currentChord;
  //       this.counter = 0;
  //     }
  //   }
  //   this.changeNotes(); //possibly change notes in currentChord

  //   if (this.moved == false) {
  //     this.p.random(this.changeNotes());
  //   }
  //   if(this.synthesizer != undefined){
  //     this.playNotesSynth();
  //   }
  //   this.counter += 1;
  //   this.moved = false;
  // }
  chance(){
    this.chance = Math.floor(Math.random() * 10 + 1) // 1 tot 10
  }

  fourbeatAlg(){
    console.log(this.fourbeatList);
    chance();
    if (voorkomkans >= chance){
      this.fourbeatList[0] = 1;
    } else {
      this.fourbeatList[0] = 0;
    }
    chance();
    if (voorkomkans >= chance){
      this.fourbeatList[5] = 1;
    } else {
      this.fourbeatList[5] = 0;
    }
    chance();
    if (voorkomkans >= chance){
      this.fourbeatList[9] = 1;
    } else {
      this.fourbeatList[9] = 0;
    }
  }

  threebeatAlg(){
    chance();
    if (voorkomkans >= chance){
      this.threebeatList[0] = 1;
    } else {
      this.threebeatList[0] = 0;
    }
    chance();
    if (voorkomkans >= chance){
      this.threebeatList[4] = 1;
    } else {
      this.threebeatList[4] = 0;
    }
    chance();
    if (voorkomkans >= chance){
      this.threebeatList[7] = 1;
    } else {
      this.threebeatList[7] = 0;
    }
    chance();
    if (voorkomkans >= chance){
      this.threebeatList[10] = 1;
    } else {
      this.threebeatList[10] = 0;
    }
  }

  // Functie voor audio engine
  initAudioEngine(){
    setInterval(()=>{
      this.fourbeatAlg();
      this.threebeatAlg();
      // Uitvoer ding
      //this.newBaseChord();
      this.riemann();
      // 'p.' is nu 'this.p.'
    }, this.speed)
  }
}

export { AudioClass };

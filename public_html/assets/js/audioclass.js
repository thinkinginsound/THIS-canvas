import { Synthesizer } from "./synthesizer.js"

class AudioClass{
  constructor(p){
    // Init variables
    console.log("AudioClass started")
    this.p = p;
    this.groupid = -1;
    this.isHerding = false;
    this.speed = 2500;
    this.chord=[60,64,67];
    this.grondtoonIndex=0;
    this.tertsIndex=1;
    this.kwintIndex=2;
    this.chordType="major";
    this.bassNote=[48];

    this.fourbeatList = [1, 0, 0, 0, 1, 0, 0, 0, 1, 0, 0, 0];
    this.threebeatList = [1, 0, 0, 1, 0, 0, 1, 0, 0, 1, 0, 0];
    this.voorkomkans = 5;
    this.chancement = 0;
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

//-----------------------Chord generator-------------------------------------------//

readChord(chordToRead){
  chordToRead.forEach((element,index)=>{
    chordToRead.forEach((element2,index2)=>{
      if (element-element2==7||element2-element==5){ // zoek naar kwint
        this.kwintIndex=index;
        this.grondtoonIndex=index2;
        this.tertsIndex=3-index2-index;
        // grote of kleine terts?
        if (chordToRead[this.tertsIndex]-chordToRead[this.grondtoonIndex]==4||chordToRead[this.grondtoonIndex]-chordToRead[this.tertsIndex]==8){
          this.chordType="major"
        } else {
          this.chordType="minor"
        }
      }
    });
  });
}

riemann(){
  this.prevChord = this.chord.slice();
  let choice = this.p.round(this.p.random(0,2)); // random keuze voor welke noot verandert
  // console.log(this.chord);
  // console.log(this.chordType);
  // console.log("Grondtoon= ", Tone.Frequency(this.chord[this.grondtoonIndex], "midi").toNote());
  // console.log("Terts= ", Tone.Frequency(this.chord[this.tertsIndex], "midi").toNote());
  // console.log("Kwint= ", Tone.Frequency(this.chord[this.kwintIndex], "midi").toNote());
  if (choice == 0){
    // Grondtoonverandering
    if(this.chordType == "major"){
      this.chord[this.grondtoonIndex]-=1;
    } else{
        this.chord[this.grondtoonIndex]-=2;
      }
  }
  if (choice == 1){
    // Tertsverandering
    if(this.chordType == "major"){
      this.chord[this.tertsIndex]-=1;
    } else{
        this.chord[this.tertsIndex]+=1;
      }
  }
  if (choice == 2){
    // Kwintverandering
    if(this.chordType == "major"){
      this.chord[this.kwintIndex]+=2;
    } else{
        this.chord[this.kwintIndex]+=1;
      }
  }
  this.readChord(this.chord);
  if(this.synthesizer != undefined){
      this.playNotesSynth();
  }
}

  //TODO:Make starter chord available
  playNotesSynth(){
    let prevBassNote = this.bassNote.slice();
    this.bassNote = [(this.chord[this.grondtoonIndex]-12)];
    let sortedPrev = prevBassNote.concat(this.prevChord.slice());
    let sortedNew = this.bassNote.concat(this.chord.slice());
    // Sort numbers from hight to low
    sortedPrev.sort((a, b) => a - b);
    sortedNew.sort((a, b) => a - b);
    // Dit kan misschien weg? (zorgt dat het niet breder dan 1,5 octaaf wordt)
    // if(sortedPrev[2] >= sortedPrev[0]+18){
    //   sortedPrev[2] = sortedPrev[0]+18;
    // }
    // if(sortedNew[2] >= sortedNew[0]+18){
    //   sortedNew[2] = sortedNew[0]+18;
    // }
    let chordToPlay = [];
    let chordToNotPlay = [];
    let push = true;
    // Dit kan misschien ook weg? (zorgt dat dubbele noten niet 2x gepusht worden)
    sortedNew.forEach((note,indexNote) => {
      sortedPrev.forEach((prevNote) => {
        if(note == prevNote){
          push = false;
          return;
        }
      });
      if(push){
        // push noten naar leesbare lijst voor synth (C4 ipv 6 naar)
        chordToNotPlay.push(Tone.Frequency(sortedPrev[indexNote], "midi").toNote());
        chordToPlay.push(Tone.Frequency(sortedNew[indexNote], "midi").toNote());
      } else {
        push = true;
      }
    });
    // Noten uit vorige lijst die niet opnieuw klinken naar noteOff
    this.synthesizer.noteOff(chordToNotPlay);
    // Nieuwe noten naar noteOn
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

//-----------------------Beat generator-------------------------------------------//
  chance(){
    this.chancement = Math.floor(Math.random() * 10 + 1) // 1 tot 10
  }

  fourbeatAlg(){
    this.chance();
    if (this.voorkomkans >= this.chancement){
      this.fourbeatList[0] = 1;
    } else {
      this.fourbeatList[0] = 0;
    }
    this.chance();
    if (this.voorkomkans >= this.chancement){
      this.fourbeatList[4] = 1;
    } else {
      this.fourbeatList[4] = 0;
    }
    this.chance();
    if (this.voorkomkans >= this.chancement){
      this.fourbeatList[8] = 1;
    } else {
      this.fourbeatList[8] = 0;
    }
  }

  threebeatAlg(){
    this.chance();
    if (this.voorkomkans >= this.chancement){
      this.threebeatList[0] = 1;
    } else {
      this.threebeatList[0] = 0;
    }
    this.chance();
    if (this.voorkomkans >= this.chancement){
      this.threebeatList[4] = 1;
    } else {
      this.threebeatList[4] = 0;
    }
    this.chance();
    if (this.voorkomkans >= this.chancement){
      this.threebeatList[7] = 1;
    } else {
      this.threebeatList[7] = 0;
    }
    this.chance();
    if (this.voorkomkans >= this.chancement){
      this.threebeatList[10] = 1;
    } else {
      this.threebeatList[10] = 0;
    }
  }

  rhythemPlayer(){
    //triggerAttackRelease()
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

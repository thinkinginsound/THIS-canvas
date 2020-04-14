class AudioClass{
  constructor(p){
    // Init variables
    console.log("AudioClass started")
    this.p = p;
    this.groupid = -1;
    this.isHerding = false;
    this.speed = 1000;
    // Nieuwe variabelen. Begin met 'this.'
    this.startchord = [60, 64, 67];
    this.basechord = this.startchord; // pakt nu frequenties inplaats van midi nootnummers TODO: maak berekening midi naar frequenties
    // GEBRUIK de lijst this.basechord om constant te spelen!
    // Start audio
    this.initAudioEngine();
    this.randomPercentage = 0;
    this.moved = false; // Zegt of er een noot in het akkoord veranderd is
    this.counter = 0;
    this.newStart = false;
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

  //TODO: newNoteLayer functies in een functie met een forloop zetten
  newNoteLayer1() {
    this.randomPercentage = this.p.round(this.p.random([0], [10])); // getal 1 t/m 10
    if (this.randomPercentage <= 4) {
      //this.basechord[0] blijft liggen
      this.basechord[0] = this.basechord[0];
      this.moved = false;
    } else if (this.randomPercentage > 4 && this.randomPercentage <= 7) {
      //this.basechord[0] gaat omhoog
      var x = this.p.random(0, 1);
      if (x == 0) {
        this.basechord[0] = this.basechord[0] + 1; //halve toon
      } else {
        this.basechord[0] = this.basechord[0] + 2; //hele toon
      }
      this.moved = true;
    } else {
      //this.basechord[0] gaat omlaag
      var x = this.p.random(0, 1);
      if (x == 0) {
        this.basechord[0] = this.basechord[0] - 1; //halve toon
      } else {
        this.basechord[0] = this.basechord[0] - 2; //hele toon
      }
      this.moved = true;
    }
  }

  newNoteLayer2() {
    this.randomPercentage = this.p.round(this.p.random([0], [10])); // getal 1 t/m 10
    if (this.randomPercentage <= 4) {
      //this.basechord[1] blijft liggen
      this.basechord[1] = this.basechord[1];
      this.moved = false;
    } else if (this.randomPercentage > 4 && this.randomPercentage <= 7) {
      //this.basechord[1] gaat omhoog
      var x = this.p.random(0, 1);
      if (x == 0) {
        this.basechord[1] = this.basechord[1] + 1; //halve toon
      } else {
        this.basechord[1] = this.basechord[1] + 2; //hele toon
      }
      this.moved = true;
    } else {
      //this.basechord[1] gaat omlaag
      var x = this.p.random(0, 1);
      if (x == 0) {
        this.basechord[1] = this.basechord[1] - 1; //halve toon
      } else {
        this.basechord[1] = this.basechord[1] - 2; //hele toon
      }
      this.moved = true;
    }
  }

  newNoteLayer3() {
    this.randomPercentage = this.p.round(this.p.random([0], [10])); // getal 1 t/m 10
    if (this.randomPercentage <= 4) {
      //this.basechord[2] blijft liggen
      this.basechord[2] = this.basechord[2];
      this.moved = false;
    } else if (this.randomPercentage > 4 && this.randomPercentage <= 7) {
      //this.basechord[2] gaat omhoog
      var x = this.p.random(0, 1);
      if (x == 0) {
        this.basechord[2] = this.basechord[2] + 1; //halve toon
      } else {
        this.basechord[2] = this.basechord[2] + 2; //hele toon
      }
      this.moved = true;
    } else {
      //this.basechord[0] gaat omlaag
      var x = this.p.random(0, 1);
      if (x == 0) {
        this.basechord[2] = this.basechord[2] - 1; //halve toon
      } else {
        this.basechord[2] = this.basechord[2] - 2; //hele toon
      }
      this.moved = true;
    }
  }

  newNote() {
    // Na 5 keer
    if (this.counter >= 5){
      this.randomCounterPercentage = this.p.round(this.p.random([0], [10])); // getal 1 t/m 10
      if (this.randomPercentage <= 7) { // 70% kans om naar het 'grondakkoord' van de reeks te gaan
        //basechord --> startchord als minimaal 1 noot overeenkomt
        for (note in basechord) {
          if (note == startchord[0]) {
            this.newStart = true;
          } else if (note == startchord[1]) {
            this.newStart = true;
          } else if (note == startchord[2]) {
            this.newStart = true;
          }
        }
        if (this.newStart == true) {
          this.basechord = this.startchord;
          this.counter = 0;
          this.newStart = false;
        }
      } else { // 30% kans om een nieuw 'grondakkoord' neer te zetten
        //startchord --> basechord
        this.startchord = this.basechord;
        console.log(this.startchord);
        this.counter = 0;
      }
    }
    this.newNoteLayer1();
    this.newNoteLayer2();
    this.newNoteLayer3();
    if (this.moved == false) {
      this.p.random(this.newNoteLayer1(), this.newNoteLayer2(), this.newNoteLayer3());
    }
    console.log(this.basechord);
    this.counter += 1;
    this.moved = false;
  }

  // Functie voor audio engine
  initAudioEngine(){
    setInterval(()=>{
      // Uitvoer ding
      this.newNote();
      // 'p.' is nu 'this.p.'
    }, this.speed)
  }
}

// Afblijven
export { AudioClass };

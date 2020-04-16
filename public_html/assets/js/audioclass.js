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
    this.basechord = this.startchord; // pakt nu frequenties inplaats van midi nootnummers
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
    this.groupid = groupid;
  }
  setIsHerding(isHerding){
    this.isHerding = isHerding;
  }

  // Nieuwe functies

  changeNotes() {
    for (let note in this.basechord) {
      this.randomPercentage = this.p.round(this.p.random([0], [10])); // getal 1 t/m 10
      if (this.randomPercentage <= 4) {
        // note blijft liggen
        this.moved = false;
      } else if (this.randomPercentage > 4 && this.randomPercentage <= 7) {
        // note gaat omhoog
        if (this.isHerding == true) {
          this.basechord[note] += 1; // halve toon
        }
        else {
          this.basechord[note] += 2; // hele toon
        }
        this.moved = true;
      } else {
        // note gaat omlaag
        if (this.isHerding == true) {
          this.basechord[note] -= 1; // halve toon
        } else {
          this.basechord[note] -= 2; // hele toon
        }
        this.moved = true;
      }
    }
  }

  newNote() {
    // Na 5 keer
    if (this.counter >= 5){
      this.randomCounterPercentage = this.p.round(this.p.random([0], [10])); // getal 1 t/m 10
      if (this.randomPercentage <= 7) { // 70% kans om naar het 'grondakkoord' van de reeks te gaan
        //basechord --> startchord als minimaal 1 noot overeenkomt
        var note;
        for (note = 0; note in this.basechord; note++) {
          if (note == this.startchord[0]) {
            this.newStart = true;
          } else if (note == this.startchord[1]) {
            this.newStart = true;
          } else if (note == this.startchord[2]) {
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
        this.counter = 0;
      }
    }
    this.changeNotes(); //possibly change notes in basechord

    if (this.moved == false) {
      this.p.random(this.changeNotes());
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

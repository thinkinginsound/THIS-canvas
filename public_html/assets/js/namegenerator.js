class NameGenerator{
  constructor(p){
    //this.p=p; // dacht p5 misschien nodig te hebben, denk het toch niet maar just in case lol.
    this.username=[];
    $.getJSON("/assets/js/usernames/adjectives.json", (Adjectives) => {
      this.adjectives = adjective;
    });
    $.getJSON("/assets/js/usernames/nouns.json", (Nouns) => {
      this.nouns = noun;
    });
    // TODO: Import JSON files here
    this.adjectives=[];
    this.nouns=[];
  }
  pickOne(nameList){
    // TODO: not the same as other users (either both or combination)
    name=nameList[random(0,nameList.length)]; // Pick random word from list
    return name;
  }
  makeUserName(){
    this.userName=[pickOne(this.adjectives),pickOne(this.nouns)]; // Combine 2 random words from lists
  }
}

export { NameGenerator };

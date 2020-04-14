class AudioClass{
  constructor(p){
    // Init variables
    console.log("AudioClass started")
    this.p = p;
    this.groupid = -1;
  }
  setGroupID(groupid){
    console.log("set groupID", groupid);
    this.groupid = groupid
  }
}

export { AudioClass };

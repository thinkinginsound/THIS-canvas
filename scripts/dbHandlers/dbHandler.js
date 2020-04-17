var dbDescription = require('./dbDescription.json')

module.exports = class {
  constructor(){
    return this;
  }
  async versionCheck(){
    let exists = await this.tableExists("system")
    if(!exists) return false;
    let dbVersion = await this.getRow("system", ['value'], {mkey: 'version'});
    if(dbVersion==undefined || dbDescription.version!=dbVersion.value){
      return false;
    }
    return true;
  }
  async createTables(){
    for(let key of Object.keys(dbDescription.tables)){
      await this.createTable(key, dbDescription.tables[key]);
    }
  }
  async updateTables(){
    console.log("Database Upgrading...");
    let tableExists = await this.tableExists("system")
    if(tableExists){
      let dbVersion = await this.getRow("system", ['value'], {mkey: 'version'});
      this.insertLogE("database", "upgrade", `Running database upgrade from ${dbVersion} to ${dbDescription.version}`);
    }

    // ------------------------------ Get Data ------------------------------ //
    let databaseBackups = {};
    for(let key of Object.keys(dbDescription.tables)){
      databaseBackups[key] = await this.getRows(key);
    }

    // --------------------------- Remove tables ---------------------------- //
    for(let key of Object.keys(dbDescription.tables)){
      await this.removeTable(key);
    }

    // --------------------------- Create tables ---------------------------- //
    await this.createTables();

    // ---------------------------- Restore data ---------------------------- //
    for(let key of Object.keys(dbDescription.tables)){
      await this.insertMany(key, databaseBackups[key]);
    }

    // --------------------------- Update values ---------------------------- //
    // Insert updated version number
    await this.insert("system", {mkey:"version", value:dbDescription.version.toString()});
    if(tableExists){
      this.insertLogE("database", "upgrade", `Database upgrade to ${dbDescription.version} Successfull`);
    } else {
      this.insertLogE("database", "install", `Database created with version ${dbDescription.version}`);
    }
    console.log("Upgrade done!")
  }

  // ------------------------------- Table Log ------------------------------ //
  insertLog(data){
    let logInsert = data;
    this.insert("logs", logInsert);
  }
  insertLogE(type, action, content){
    let logInsert = {};
    logInsert.type = type;
    logInsert.action = action;
    logInsert.content = content;
    this.insertLog(logInsert);
  }
  getLogs(amount = -1){
    let logs = this.getRows("logs", ["*"]);
    if(amount==-1)return logs;
    else {
      logs = logs.slice(-amount);
      return logs;
    }
  }

  // ---------------------------- Table Sessions ---------------------------- //
  insertSession(sessionKey, groupid, ismobile = false){
    let sessionsInsert = {};
    sessionsInsert.sessionkey = sessionKey;
    sessionsInsert.groupid = groupid;
    sessionsInsert.ismobile = ismobile;
    this.insert("sessions", sessionsInsert);
  }
  updateSession(sessionKey){
    let sessionsInsert = {};
    sessionsInsert.lastlogin = "strftime('%Y-%m-%d %H:%M:%f', 'now')";
    this.updateRow("sessions", sessionsInsert, {sessionkey: sessionKey});
  }
  disableSession(sessionKey){
    let sessionsInsert = {};
    sessionsInsert.groupid = -1;
    this.updateRow("sessions", sessionsInsert, {sessionkey: sessionKey});
  }
  async checkExistsSession(sessionKey){
    let row = await this.getRow("sessions", ['*'], {sessionkey: sessionKey});
    if(row==false || row.groupid==-1){
      return false
    } else return true;
  }
  cleanupSession(){
    this.removeRow("sessions", ["*"], `lastlogin > strftime('%Y-%m-%d %H:%M:%f', datetime('now'), '-1 day')`);
  }
  async getSession(sessionKey){
    let session = await this.getRow("sessions", ["*"], {sessionkey: sessionKey});
    return session
  }
  async getSessionGroups(){
    let returnable = [];
    for(let i = 0; i < global.maxgroups; i++){
      returnable[i] = [];
    }
    let sessions = await this.getRows("sessions", ["*"], `lastlogin > strftime('%Y-%m-%d %H:%M:%f', datetime('now'), '-5 minute')`);
    for(let session of sessions){
      if(session.groupid==-1)continue;
      returnable[session.groupid].push(session);
    }
    return returnable;
  }

  // ---------------------------- Table Userdata ---------------------------- //
  insertUserdata(sessionKey, data){
    data.sessionkey = sessionKey;
    this.insert("userdata", data);
  }
  updateUserdataHerding(sessionKey, clock, isHerding){
    let isNPC = sessionKey.indexOf("npc_")!=-1;
    let data = {isherding:isHerding}
    if(!isNPC)this.updateRow("sessions", data, {sessionkey:sessionKey});
    this.updateRow("userdata", data, {sessionkey:sessionKey, clock:clock});
  }
  getUserdataBySessionkey(sessionKey){
    let userdata = this.getRows("userdata", ["*"], {sessionkey: sessionKey});
    return userdata;
  }
  getUserdataByClock(clock){
    let userdata = this.getRows("userdata", ["*"], `clock > ${clock}`);
    return userdata;
  }
  cleanupUserdata(){
    this.removeRow("userdata", ["*"], `datetime > strftime('%Y-%m-%d %H:%M:%f', datetime('now'), '-1 day')`);
  }
  getHighestClock(){
    let userdata = this.getRow("userdata", ["MAX(clock)"]);
    let maxclock = userdata["MAX(clock)"];
    if(maxclock === null) maxclock = -1;
    return maxclock;
  }
}

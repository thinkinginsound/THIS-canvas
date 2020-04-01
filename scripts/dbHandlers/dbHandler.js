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
}

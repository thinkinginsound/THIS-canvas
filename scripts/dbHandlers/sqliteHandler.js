var sqlite3 = require('better-sqlite3');
let dbHandler = require("./dbHandler.js");

module.exports = class extends dbHandler {
  constructor(config){
    super();
    this.config = {
      filename : `database.sqlite`,
      prefix   : '',
      ...config
    };
    this.openDB(this.config.filename);
    return this;
  }
  openDB(filename){
    this.db = new sqlite3(filename);
  }
  closeDB(){
    if(this.db==undefined)return;
    this.db.close();
    if(debug)console.log("DB closed")
  }
  checkDB(){
    let prefixTable = this.config.prefix + "system"
    let fileExists = fileExists(this.config.filename);
    let tableExists = tableExists(prefixTable);
    return {
      fileExists: fileExists,
      tableExists: tableExists,
      status: (fileExists || tableExists)?"failed":"success"
    }
  }
  fileExists(filename){
    return fs.existsSync(filename);
  }
  tableExists(table_name){
    let prefixTable = this.config.prefix + table_name
    let value = this.getRow('sqlite_master', ["name"], `type='table' AND name = '${prefixTable}'`);
    // console.log("value", prefixTable, value);
    return value!=false;
  }

  getRow(table, fields = ["*"], search = undefined){
    let prefixTable = (table!="sqlite_master")?this.config.prefix + table:table
    if(typeof search == "object"){
      let searchArr = [];
      for (var itm in search) {
        searchArr.push(`${itm} = '${search[itm]}'`);
      }
      search = searchArr.join(" AND ");
    }
    let query = `SELECT ${fields.join(", ")} FROM ${prefixTable}`;
    if(search!=undefined)query+=` WHERE ${search}`;
    query+=";";
    let prepare = this.db.prepare(query);
    let value = prepare.get();
    if (value==undefined)value = false;
    return value;
  }
  getRows(table, fields = ["*"], search = undefined){
    let prefixTable = this.config.prefix + table
    if(typeof search == "object"){
      let searchArr = [];
      for (var itm in search) {
        searchArr.push(`${itm} = '${search[itm]}'`);
      }
      search = searchArr.join(" AND ");
    }
    let query = `SELECT ${fields.join(", ")} FROM ${prefixTable}`;
    if(search!=undefined)query+=` WHERE ${search}`;
    query+=";";
    // console.log("exists", prefixTable, this.tableExists(table))
    if(!this.tableExists(table))return false;
    let prepare = this.db.prepare(query);
    let value = prepare.all();
    if (value==undefined)value = false;
    return value;
  }

  insert(table, data){
    let prefixTable = this.config.prefix + table
    let fields = Object.keys(data);
    let query = `INSERT OR REPLACE INTO ${prefixTable} (${fields.join(", ")}) VALUES (${fields.map(function(e) {return '@' + e}).join(", ")})`;
    // console.log("query", query);
    const insert = this.db.prepare(query);
    insert.run(data);
  }
  insertMany(table, data){
    let prefixTable = this.config.prefix + table
    if(!data || data.length==0)return;
    let fields = Object.keys(data[0]);
    let query = `INSERT OR REPLACE INTO ${prefixTable} (${fields.join(", ")}) VALUES (${fields.map(function(e) {return '@' + e}).join(", ")})`;
    const insert = this.db.prepare(query);
    const insertMany = this.db.transaction((insertData) => {
      for (const row of insertData) {
        if(row==undefined)continue;
        insert.run(row);}
    });
    insertMany(data);
  }

  updateRow(table, dataObject, search){
    let prefixTable = this.config.prefix + table
    if(typeof search == "object"){
      let searchArr = [];
      for (var itm in search) {
        searchArr.push(`${itm} = '${search[itm]}'`);
      }
      search = searchArr.join(" AND ");
    }

    let dataArr = [];
    let parseCompleteList = [
      "datetime('now')"
    ]
    for (var itm in dataObject) {
      if(parseCompleteList.includes(dataObject[itm])){
        dataArr.push(`${itm} = ${dataObject[itm]}`);
      } else {
        dataArr.push(`${itm} = '${dataObject[itm]}'`);
      }
    }
    let dataString = dataArr.join(", ");

    let query = `UPDATE ${prefixTable} SET ${dataString} WHERE ${search};`;
    // console.log("query", query)
    const insert = this.db.prepare(query);
    insert.run();
  }

  removeRow(table, search){
    let prefixTable = this.config.prefix + table
    if(typeof search == "object"){
      let searchArr = [];
      for (var itm in search) {
        searchArr.push(`${itm} = '${search[itm]}'`);
      }
      search = searchArr.join(" AND ");
    }
    if(search==undefined)return false;
    let query = `DELETE FROM ${prefixTable} WHERE ${search};`;
    // console.log("query", query)
    const remove = this.db.prepare(query);
    remove.run();
    return true;
  }

  createTable(tablename, fields){
    let prefixTable = this.config.prefix + tablename
    let query = `CREATE TABLE ${prefixTable} (`;
    for(let itm of fields) {
      let has_autoincrement = itm.mod.indexOf('AUTO_INCREMENT')
      if(has_autoincrement != -1){
        itm.mod[has_autoincrement] = ''
      }
      query += `\n  ${itm.key} ${itm.type} ${itm.mod.join(" ")},`;
    };
    query = query.substring(0, query.length - 1);
    query+="\n);"
    let prepare = this.db.prepare(query);
    prepare.run();
  }
  removeTable(tablename){
    let prefixTable = this.config.prefix + tablename
    let query = `DROP TABLE IF EXISTS ${prefixTable}`;
    let prepare = this.db.prepare(query);
    prepare.run();
  }
  truncateTable(tablename){
    let prefixTable = this.config.prefix + tablename
    let query = `DELETE FROM ${prefixTable}`;
    let prepare = this.db.prepare(query);
    prepare.run();
  }

  getColumns(table){
    let prefixTable = this.config.prefix + table
    let query = `PRAGMA table_info(${prefixTable})`;
    let prepare = this.db.prepare(query);
    let value = prepare.all();
    if (value==undefined)return false;

    let returnable = [];
    value.forEach(function(col){
      returnable.push(col.name);
    });

    return returnable;
  }
}

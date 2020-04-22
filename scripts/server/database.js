const SQLiteHandler = require('../dbHandlers/sqliteHandler.js');

module.exports = {
  initDatabase:async function(runmode, purgedb){
    global.dbHandler = new SQLiteHandler({
      filename:`database${(runmode!="production"?'_'+runmode:"")}.db`,
      prefix:"cv_"
    });
    if(!await dbHandler.versionCheck()){
      await dbHandler.updateTables();
    }

    // Write private key to db
    global.privatekey = await dbHandler.getRow("system", ['value'], {mkey: 'privatekey'});
    if(!global.privatekey){
      global.privatekey = global.tools.randomKey(16);
      dbHandler.insert("system", {mkey:'privatekey',value:global.privatekey});
    } else global.privatekey = global.privatekey.value;

    // Remove old data from database
    await dbHandler.truncateTable("sessions");
    if(purgedb){
      await dbHandler.truncateTable("userdata");
    }
  }
}

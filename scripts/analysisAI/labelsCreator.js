const wrCsv = require('./writeToCsv');
const NPC = require('../npcAI/simpleNPC').randomNPC

function createLabels(NOU,path){
    const numOfUsers = NOU;
    let listofdata = [];
    for(var i = 0; i < numOfUsers; i++){
        let bullean = Math.round(Math.random());
        listofdata.push([bullean]);
    };

    wrCsv.writeToCsv(listofdata,path);
}

module.exports = {createLabels}
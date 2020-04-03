const wrCsv = require('./writeToCsv');

function createLabels(NOU,path){
    const numOfUsers = 5;
    let listofdata = [];
    for(var i = 0; i < numOfUsers; i++){
        let bullean = Math.round(Math.random());
        listofdata.push([bullean]);
    };

    wrCsv.writeToCsv(listofdata,path);
}

module.exports = {createLabels}
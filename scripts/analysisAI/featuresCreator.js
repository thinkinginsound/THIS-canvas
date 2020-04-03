const wrCsv = require('./writeToCsv');

function createFeatures(NOU,NOF,path){
    const canvasWidth = 800;
    const canvasHeigth = 500;
    const numOfFrames = NOF;
    const numOfUsers = NOU;
    let listofdata = [];
    //Generate Features
    for(i=0; i < numOfUsers; i++){
        let listUser = [];
        for(j=0; j < numOfFrames; j++){
            listUser.push(
                String(Math.floor(Math.random() * canvasWidth))//.concat(';', String(Math.floor(Math.random() * canvasHeigth)))
            );
        };
        listofdata.push(listUser);
    };

    wrCsv.writeToCsv(listofdata,path);
}

module.exports = {createFeatures}
const wrCsv = require('./writeToCsv');
const NPC = require('../npcAI/simpleNPC').randomNPC

function createFeatures(NOU,NOF,path,sync){
    const numOfFrames = NOF+1;
    const numOfUsers = NOU;
    let listofdata = [];
    let movesSet = [];
    let NPCs = []
    //Generate virtual users
    for(i=0; i < numOfUsers; i++){
        NPCs[i] = new NPC(500,500,(Math.floor(Math.random()*100)+100),(Math.floor(Math.random()*100)+100));
    };
    //Move all NPC over num of frames
    for(i=0; i < numOfFrames; i++){
        let movedList = []
        for(j=0; j < numOfUsers; j++){
            let xy = NPCs[j].move();
            movedList.push(xy);
        }
        movesSet.push(movedList);
    }

    //interpret inputdata
    movesSet.forEach(function(frameArray=value,frameNum=index){
        let singleFrameDeg = [];
        if(frameNum != 0){
            frameArray.forEach(function(userCoordinates=value, userNum=index){
                let xDirection = movesSet[frameNum-1][userNum][0] - userCoordinates[0];
                let yDirection = movesSet[frameNum-1][userNum][1] - userCoordinates[1];
                if(xDirection == 0 && yDirection == 0) {
                    singleFrameDeg.push(-1);
                } else if(xDirection == 1 && yDirection == 0) {
                    singleFrameDeg.push(0);
                } else if(xDirection == 1 && yDirection == 1) {
                    singleFrameDeg.push(45);
                } else if(xDirection == 0 && yDirection == 1) {
                    singleFrameDeg.push(90);
                } else if(xDirection == -1 && yDirection == 1) {
                    singleFrameDeg.push(135);
                } else if(xDirection == -1 && yDirection == 0) {
                    singleFrameDeg.push(180);
                } else if(xDirection == -1 && yDirection == -1) {
                    singleFrameDeg.push(225);
                } else if(xDirection == 0 && yDirection == -1) {
                    singleFrameDeg.push(270);
                } else if(xDirection == 1 && yDirection == -1) {
                    singleFrameDeg.push(315);
                }
            });
            listofdata.push(singleFrameDeg);
        }
    });
    wrCsv.writeToCsv(listofdata,path,sync);
}

module.exports = {createFeatures}
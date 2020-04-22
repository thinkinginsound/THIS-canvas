/*Machinelearning Class
Predict(toPredictCircularBuffer) //IS a 3D buffer
loadModel()
getAIHerding()
*/

const tf = require("@tensorflow/tfjs-node");

class MLManager{
    constructor(modelPath,usergroups){
        this.herdingList = [];
        this.model = undefined;
        this.loadModelFile(modelPath);
        for(let i = 0; i < usergroups; i++){
            this.heardingList.push([])
        }
    }

    async loadModelFile(modelPath){
        this.model = await tf.loadLayersModel(modelPath);
      }

    prediction(EDMatrix){
        if(this.model === undefined)return;
        EDMatrix.forEach((group,index)=>{
            let toPredict = tf.cast(tf.tensor2d(group),'int32');
            let predlabels = this.model.predict(toPredict);
            let grouplist = []
            predlabels.arraySync().forEach(row => {
                let rows = [];
                row.forEach(value => {
                    if(value >=0.5){rows.push(1)}
                    else{rows.push(0)};
                });
                grouplist.push(rows);
            });
            this.herdingList[index] = grouplist.slice();
        });
    }

    getHerdingList(){
        return this.herdingList;
    }

    addUsergroup(numberOfGroups){
        for(let i = 0; i < numberOfGroups; i++){
            this.herdingList.push([]);
        }
    }

    removeUsergroup(numberOfGroups){  //StillBeta
        for(let i = 0; i < numberOfGroups; i++){
            this.herdingList.pop();
        }
    }
}

function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
  
  async function demo() {
    let dead = new MLManager("file://../../data/model/model.json");
    for(let i = 0; i < 2; i++){
        let pred = dead.prediction([
            [
                [1,1,1,1],
                [0,0,0,0]
            ],
            [
                [1,1,1,1],
                [0,0,0,0]
            ],
            [
                [1,1,1,1],
                [0,0,0,0]
            ],
            [
                [1,1,1,1],
                [0,0,0,0]
            ]
        ]);
        await sleep(500);
    }
}
  
demo();

/*
~~~OldCode~~~
statusPrinter(statusIndex++, "Init Machine Learning");
for(let npcGroupIndex in npcs){
  for(let npcUserIndex in npcs[npcGroupIndex]){
    npcs[npcGroupIndex][npcUserIndex] = new NPC(
      global.npcCanvasWidth,
      global.npcCanvasHeight,
      tools.randomInt(global.npcCanvasWidth),
      tools.randomInt(global.npcCanvasHeight)
    );
  }
}
if(runmode=="debug"){
  async function loadModelFile(modelPath){
    model = await tf.loadLayersModel(modelPath); //path: 'file://../../data/model/model.json'
  }
  loadModelFile("file://data/model/model.json");
}

for(let i = 0; i < global.maxgroups; i++){
    //TODO: implement to read return analysis AI. Replace the string path with input data of type array.
    if(runmode=="debug"){
    AIresponseGroups[i] = await aiPrediction.prediction(AIInput[i],model);
    } else {
    AIresponseGroups[i] = slowAnalysis.createLabels(AIInput[i],8,2);
    }
    let offset = aiHopInterval + aiEvalFrames;
    for(let j = 0; j < global.maxusers; j++){
    let lastIndex = AIresponseGroups[i].length-1;
    let firstIndex = AIresponseGroups[i].length-1-offset;
    let isHerding =
        AIresponseGroups[i][lastIndex][j] &&
        AIresponseGroups[i][firstIndex][j];
    AIresponse[i][j] = isHerding
    }
}
*/
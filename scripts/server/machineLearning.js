/*Machinelearning Class
Predict(toPredictCircularBuffer) //IS a 3D buffer
loadModel()
getAIHerding()
*/



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
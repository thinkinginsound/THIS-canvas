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

module.exports = {
    MLManager: MLManager
}
const tf = require("@tensorflow/tfjs-node");
const fs = require("fs");
const parse = require("csv-parse/lib/sync");

async function prediction(predictionPath,modelPath){
    let pred = tf.cast(tf.tensor2d(parse(fs.readFileSync(predictionPath, 'utf8').toString() , { //path example: "../../data/predictions.csv"
        columns: false,
        skip_empty_lines: true,
        cast: true
    })),'int32');
    const model = await tf.loadLayersModel(modelPath); //path: 'file://../../data/model/model.json'
    let predlabels = model.predict(pred);
    let list = []
    predlabels.arraySync().forEach(row => {
        let rows = [];
        row.forEach(value => {
            if(value >=0.5){rows.push(1)}
            else{rows.push(0)};
        });
        list.push(rows);
    });
    console.log(list)
}

module.exports = {prediction}
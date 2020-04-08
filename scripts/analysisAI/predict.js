const tf = require("@tensorflow/tfjs-node");
const fs = require("fs");
const parse = require("csv-parse/lib/sync");

async function prediction(prediction,model){
    if(typeof model == "undefined") return [],console.error("model is undefined");
    let inputprediction = null;
    if(typeof prediction == "string"){
        inputprediction = parse(fs.readFileSync(prediction, 'utf8').toString() , { //path example: "../../data/predictions.csv"
            columns: false,
            skip_empty_lines: true,
            cast: true
        });
    } else {
        inputprediction = prediction;
    }
    toPredict = tf.cast(tf.tensor2d(inputprediction),'int32');
    let predlabels = model.predict(toPredict);
    let list = []
    predlabels.arraySync().forEach(row => {
        let rows = [];
        row.forEach(value => {
            if(value >=0.5){rows.push(1)}
            else{rows.push(0)};
        });
        list.push(rows);
    });
    return list;
}

module.exports = {prediction}
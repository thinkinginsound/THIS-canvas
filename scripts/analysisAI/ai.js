const tf = require("@tensorflow/tfjs-node");
const fs = require("fs");
const parse = require("csv-parse/lib/sync");

async function train() {
    let features = tf.cast(tf.tensor2d(parse(fs.readFileSync("../../data/features.csv", 'utf8').toString() , {
        columns: false,
        skip_empty_lines: true,
        cast: true
    })),'int32');

    let labels = tf.cast(tf.tensor2d(parse(fs.readFileSync("../../data/labels.csv", 'utf8').toString() , {
        columns: false,
        skip_empty_lines: true,
        cast: true
    })),'int32');

    let featuresVal = tf.cast(tf.tensor2d(parse(fs.readFileSync("../../data/featuresVal.csv", 'utf8').toString() , {
        columns: false,
        skip_empty_lines: true,
        cast: true
    })),'int32');

    let labelsVal = tf.cast(tf.tensor2d(parse(fs.readFileSync("../../data/labelsVal.csv", 'utf8').toString() , {
        columns: false,
        skip_empty_lines: true,
        cast: true
    })),'int32');

    let pred = tf.cast(tf.tensor2d(parse(fs.readFileSync("../../data/predictions.csv", 'utf8').toString() , {
        columns: false,
        skip_empty_lines: true,
        cast: true
    })),'int32');

    //MLP Multi Layer Peceptron
    let model = tf.sequential();
    model.add(tf.layers.dense({units: 5000, activation: 'sigmoid',inputShape:[4]}));
    model.add(tf.layers.dense({units: 2500, activation: 'sigmoid'}));
    model.add(tf.layers.dense({units: 4, activation: 'softmax'}));
    model.compile({loss: 'binaryCrossentropy', optimizer: 'sgd', metrics: ['accuracy']});
    model.fit(features,labels, {epochs: 3,batchSize: 25,validationData:(featuresVal,labelsVal)}).then(info => {
        console.log(info.history);
       });

    await model.save('file://../../data/model/');
}
train();
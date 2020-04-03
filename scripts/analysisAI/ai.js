const tf = require("@tensorflow/tfjs-node");
const fs = require("fs");
const parse = require("csv-parse/lib/sync")

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

let pred = tf.cast(tf.tensor2d(parse(fs.readFileSync("../../data/predictions.csv", 'utf8').toString() , {
    columns: false,
    skip_empty_lines: true,
    cast: true
})),'int32');

let model = tf.sequential();
model.add(tf.layers.dense({units: 1, activation: 'relu', inputShape: [300]}));
model.add(tf.layers.dense({units: 1, activation: 'relu'}));
model.add(tf.layers.dense({units: 1, activation: 'relu'}));
model.summary();
model.compile({optimizer: 'sgd', loss: 'meanSquaredError'});
model.fit(features,labels, epochs=1000);
let predlabels = model.predict(pred);
predlabels.print();
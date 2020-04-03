const tf = require("@tensorflow/tfjs-node");
const pd = require('node-pandas');

let model = tf.sequential();

let labels = pd.readCsv('../../data/labels.csv');
console.log("labels",labels);
let features = pd.readCsv("../../data/features.csv");
console.log("features",features);

model.add(tf.layers.dense({units: 128, activation: 'relu', inputShape: [50]}));
model.add(tf.layers.lstmCell({units: 128, return_sequences: false}));
model.add(tf.layers.dense({units: 128, activation: 'relu'}));
model.summary();
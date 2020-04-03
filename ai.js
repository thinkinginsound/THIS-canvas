const tf = require("@tensorflow/tfjs-node");
const model = tf.sequential();

model.add(tf.layers.dense({units: 128, activation: 'relu', inputShape: [50]}));
model.add(tf.layers.lstmCell({units: 128, return_sequences: false}));
model.add(tf.layers.dense({units: 128, activation: 'relu'}));
model.summary();
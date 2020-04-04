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
model.add(tf.layers.dense({units: 70, activation: 'sigmoid',inputShape: [5]}));
model.add(tf.layers.dense({units: 35, activation: 'sigmoid'}));
model.add(tf.layers.dense({units: 5, activation: 'sigmoid'}));
model.compile({loss: 'categoricalCrossentropy', optimizer: 'sgd', metrics: ['acc']});
model.summary();
model.fit(features,labels, epochs=1000);
let predlabels = model.predict(pred);
predlabels.print();
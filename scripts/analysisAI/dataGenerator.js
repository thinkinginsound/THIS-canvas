const labels = require('./labelsCreator')
const features = require('./featuresCreator')

const numberOfFrames = 7500;
const numberOfUsers = 4;

// features.createFeatures(numberOfUsers,numberOfFrames,"../../data/features.csv",true);
// labels.createLabels("../../data/features.csv","../../data/labels.csv",8,2);
features.createFeatures(numberOfUsers,30,"../../data/predictions.csv",false);
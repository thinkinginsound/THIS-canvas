const labels = require('./labelsCreator')
const features = require('./featuresCreator')

const numberOfFrames = 15;
const numberOfUsers = 5;

// labels.createLabels(numberOfUsers,"../../data/labels.csv");
// features.createFeatures(numberOfUsers,numberOfFrames,"../../data/features.csv");
features.createFeatures(numberOfUsers,numberOfFrames,"../../data/predictions.csv");
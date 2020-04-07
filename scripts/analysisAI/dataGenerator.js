const labels = require('./labelsCreator')
const features = require('./featuresCreator')

const numberOfFrames = 1000;
const numberOfUsers = 4;

features.createFeatures(numberOfUsers,numberOfFrames,"../../data/features.csv",true);
labels.createLabels("../../data/features.csv","../../data/labels.csv",6,2);
features.createFeatures(numberOfUsers,numberOfFrames,"../../data/featuresVal.csv",true);
labels.createLabels("../../data/features.csv","../../data/labelsVal.csv",6,2);
features.createFeatures(numberOfUsers,30,"../../data/predictions.csv",false);
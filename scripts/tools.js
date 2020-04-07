var randomstring = require("randomstring");
var crypto = require('crypto');

function randomKey(length){
  return randomstring.generate({length: length, charset: 'alphanumeric', capitalization: 'lowercase'});
}
function randomInt(min, max) {
  if(max === undefined){
    max = min;
    min = 0;
  }
  return Math.floor(Math.random() * Math.floor(max));
}
function encryption(key, iv, data){
  var mykey = crypto.createCipheriv('aes-128-cbc', key, iv);
  var mystr = mykey.update(data, 'utf8', 'base64');
  mystr += mykey.final('base64');
  return mystr;
}

function createArray(x, y, fill=undefined) {
  return new Array(x).fill(0).map(() => new Array(y).fill(fill))
}

function pointDiff (num1, num2) {
  if (num1 > num2) {
    return (num1 - num2);
  } else {
    return (num2 - num1);
  }
};

function pointDist (x1, y1, x2, y2) {
  var deltaX = pointDiff(x1, x2);
  var deltaY = pointDiff(y1, y2);
  var dist = Math.sqrt(Math.pow(deltaX, 2) + Math.pow(deltaY, 2));
  return (dist);
};

module.exports = {
    randomKey: randomKey,
    randomInt: randomInt,
    encryption: encryption,
    createArray: createArray,
    pointDiff: pointDiff,
    pointDist: pointDist
}

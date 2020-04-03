var randomstring = require("randomstring");
var crypto = require('crypto');

exports.randomKey = function(length){
  return randomstring.generate({length: length, charset: 'alphanumeric', capitalization: 'lowercase'});
}
exports.encryption = function(key, iv, data){
  var mykey = crypto.createCipheriv('aes-128-cbc', key, iv);
  var mystr = mykey.update(data, 'utf8', 'base64');
  mystr += mykey.final('base64');
  return mystr;
}

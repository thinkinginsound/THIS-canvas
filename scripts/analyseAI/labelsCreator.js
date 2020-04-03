const pd = require('node-pandas');

const numOfUsers = 5;
let columns = ['users'];
let listofdata = [];

//Create Labels
columns = ['users','hoarding'];
listofdata = [];
for(i=0; i < numOfUsers; i++){
    let bullean = Math.round(Math.random());
    listofdata.push([String(i+1),bullean]);
};

console.log(listofdata)

df = pd.DataFrame(listofdata,columns);
df.toCsv("../../data/labels.csv");
const pd = require('node-pandas');

const canvasWidth = 800;
const canvasHeigth = 500;
const numOfFrames = 15;
const numOfUsers = 5;
let columns = ['users'];
let listofdata = [];

//Generate Features
for(i=0; i < numOfUsers; i++){
    let listUser = [String(i+1)];
    for(j=0; j < numOfFrames; j++){
        listUser.push(
            String(Math.floor(Math.random() * canvasWidth)).concat(';', 
            String(Math.floor(Math.random() * canvasHeigth)))
        );
    };
    listofdata.push(listUser);
};
for(i=0; i < numOfFrames; i++){
    columns.push(String('frame').concat(String(i+1)));
};

let df = pd.DataFrame(listofdata,columns);
df.toCsv("../../data/features.csv"); //Incase this does not work then update CsvBase.js line 32, replace columns by this.columns
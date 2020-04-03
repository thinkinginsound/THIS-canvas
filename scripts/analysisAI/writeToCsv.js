const fs = require('fs')

function writeToCsv(data,path){
    let csvText = '';
    for(let r = 0; r < data.length; ++r) {
        for(let c = 0; c < data[0].length; ++c) {
            csvText += data[r][c] + ',';
        }
        csvText = csvText.trim().slice(0, -1)  + '\n' // Remove , from end of last line
    }
    csvText = csvText.trim();
    fs.writeFile(path, csvText, (error) => {
        if(error) {
            messages.error(`${error}`)
        } else {
            if(this.out) {
                console.log(`CSV file is successfully created at ${outCsvPath}`)
            }
        }
    });
    console.log("...done!");
}

module.exports = {
    writeToCsv
}
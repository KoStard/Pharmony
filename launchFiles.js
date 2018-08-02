/* jshint esversion: 6 */
let exec = require('child_process').exec;

module.exports = {
    launch: launch
};

function getCommandLine() {
    switch (process.platform) { 
       case 'darwin' : return 'open';
       case 'win32' : return '';
       case 'win64' : return '';
       default : return 'xdg-open';
    }
}

function launch(filePath='') {
    filePath = `"${filePath}"`;
    console.log(exec(getCommandLine()+' '+filePath));
}
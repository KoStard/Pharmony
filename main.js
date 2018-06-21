/* jshint esversion: 6 */
const {app, BrowserWindow, Menu} = require('electron');
const url = require ('url');
const path = require ('path');

let win;

function createWindow(){
    win = new BrowserWindow({width: 800, height: 600});
    win.loadURL(url.format({
        pathname: path.join(__dirname, 'index.html'),
        protocol: 'file:',
        slashes: true
    }));
    win.on('closed', ()=>{app.quit();});
    // Menu.setApplicationMenu(Menu.buildFromTemplate(mainMenuTemplate));
}

app.on('ready', createWindow);


let mainMenuTemplate = [
    {
        label: 'File',
        submenu: [
            {
                label: 'Edit collections list.',
                click: ()=>{
                    win.webContents.send('edit-collections-list-clicked');
                }
            }
        ]
    },
    {
        label: 'DevTools',
        role: 'toggledevtools'
    }
];
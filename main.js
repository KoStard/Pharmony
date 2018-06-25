/* jshint esversion: 6 */
const {app, BrowserWindow, Menu, ipcMain} = require('electron');
const url = require ('url');
const path = require ('path');

let win;

function createWindow(){
    win = new BrowserWindow({width: 800, height: 600});
    ['started', 'stopEditCollectionsListMode'].forEach((x)=>{ipcMain.on(x, ()=>{
        mainMenuTemplate[0].submenu[1].visible = true;
        mainMenuTemplate[0].submenu[2].visible = false;
        Menu.setApplicationMenu(Menu.buildFromTemplate(mainMenuTemplate));
    });
    win.loadURL(url.format({
        pathname: path.join(__dirname, 'index.html'),
        protocol: 'file:',
        slashes: true
    }));
    win.on('closed', ()=>{app.quit();});
    Menu.setApplicationMenu(Menu.buildFromTemplate(mainMenuTemplate));
});
}

app.on('ready', createWindow);

let mainMenuTemplate = [
    {
        label: 'Collections',
        submenu: [
            {
                label: 'Add new collection.',
                click: ()=>{
                    win.webContents.send('add-new-collection-clicked');
                }
            },{
                label: 'Edit collections list.',
                visible: true,
                click: ()=>{
                    mainMenuTemplate[0].submenu[1].visible = false;
                    mainMenuTemplate[0].submenu[2].visible = true;
                    Menu.setApplicationMenu(Menu.buildFromTemplate(mainMenuTemplate));
                    win.webContents.send('edit-collections-list-clicked');
                }
            },{
                label: 'Back to menu.',
                visible: false,
                click: ()=>{
                    mainMenuTemplate[0].submenu[1].visible = true;
                    mainMenuTemplate[0].submenu[2].visible = false;
                    Menu.setApplicationMenu(Menu.buildFromTemplate(mainMenuTemplate));
                    win.webContents.send('back-to-menu-clicked');
                }
            }
        ]
    },
    {
        label: 'DevTools',
        submenu: [
            {
                label: 'Toggle DevTools',
                role: 'toggledevtools',
                click: ()=>{
                    console.log('reloading');
                }
            },
            {
                label: 'Reload',
                role: 'reload',
                click: ()=>{
                    console.log('reloading');
                }
            },
            {
                label: 'Force Reload',
                role: 'forceReload',
                click: ()=>{
                    console.log('reloading');
                }
            }
        ]
    }
];
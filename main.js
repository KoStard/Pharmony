/* jshint esversion: 6 */
const {app, BrowserWindow, Menu, ipcMain} = require('electron');
const url = require ('url');
const path = require ('path');

let win;

function createWindow(){
    win = new BrowserWindow({width: 800, height: 600});
    ['started', 'stopEditCollectionsListMode'].forEach((x)=>{ipcMain.on(x, ()=>{
        mainMenuTemplate[1].submenu[1].visible = true;
        mainMenuTemplate[1].submenu[2].visible = false;
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
        label: 'Electron',
        submenu: [
            {
                label: 'Undo',
                role: 'undo'
            },{
                label: 'Redo',
                role: 'redo'
            },{
                label: 'Copy',
                role: 'copy'
            },{
                label: 'Cut',
                role: 'cut'
            },{
                label: 'Paste',
                role: 'paste'
            },{
                label: 'SelectAll',
                role: 'selectAll'
            },{
                label: 'Delete',
                role: 'delete'
            },{
                label: 'Close',
                role: 'close'
            },{
                label: 'Quit',
                role: 'quit'
            },{
                label: 'ZoomIn',
                role: 'zoomIn'
            },{
                label: 'ZoomOut',
                role: 'zoomOut'
            },{
                label: 'Hide',
                role: 'hide'
            }
        ]
    },
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
                    mainMenuTemplate[1].submenu[1].visible = false;
                    mainMenuTemplate[1].submenu[2].visible = true;
                    Menu.setApplicationMenu(Menu.buildFromTemplate(mainMenuTemplate));
                    win.webContents.send('edit-collections-list-clicked');
                }
            },{
                label: 'Back to menu.',
                visible: false,
                click: ()=>{
                    mainMenuTemplate[1].submenu[1].visible = true;
                    mainMenuTemplate[1].submenu[2].visible = false;
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
                role: 'toggledevtools'
            },
            {
                label: 'Reload',
                role: 'reload'
            },
            {
                label: 'Force Reload',
                role: 'forceReload'
            }
        ]
    }
];
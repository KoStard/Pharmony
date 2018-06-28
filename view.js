/* jshint esversion: 6 */
let fs = require('fs');
let docx = require('docx');
let popup = require('./popup');
let launch = require('./launchFiles');
let {ipcRenderer} = require('electron');
let Selector = require('./selector');

let blocks = {};
const databasesFolder = 'Databases/';
let runningDatabase = 'Pharmacology';
let container = document.getElementById('container');
let menu = document.getElementById('menu');
let menuButtonContainer = document.getElementById('menu-buttonContainer');
let table = document.getElementById('table');
let input = document.getElementById('input');
let settingsDropdownContent = document.getElementById('settings-dropdown-content');
let detailsButton = document.getElementById('details-button');
let newCollectionButton, removeCollectionsButton;

let tableScrollAnchor = 'bottom';

function refreshScrollLevel(){
    if (tableScrollAnchor == 'top') {
        table.parentElement.scrollTo(0,0);
    } else if (tableScrollAnchor == 'bottom') {
        table.parentElement.scrollTo(0,table.parentElement.scrollHeight-table.parentElement.clientHeight);
    }
}

function createButton({value, buttonClass, buttonID, onclick, owner}) {
    if (!value) {
        return false;
    }
    let newButton = document.createElement('button');
    newButton.innerText = value;
    if (buttonClass) newButton.className = buttonClass;
    if (buttonID) newButton.id = buttonID;
    if (onclick) newButton.onclick = onclick;
    if (owner) {
        owner.appendChild(newButton);
    }
    return newButton;
}

function settingsCreator(){
    createButton({
        value: 'Menu',
        onclick: ()=>{toggleToMenu();},
        owner: settingsDropdownContent
    });
    createButton({
        value: 'Standart Export',
        onclick: ()=>{responsiveExport({mode:'standart', keys: Object.keys(blocks)});},
        owner: settingsDropdownContent
    });
    createButton({
        value: 'Full Export',
        onclick: ()=>{responsiveExport({mode:'full', keys: Object.keys(blocks)});},
        owner: settingsDropdownContent
    });
    createButton({
        value: 'Selective Export',
        onclick: ()=>{responsiveExport({mode:'full', keys: Object.keys(blocks).filter(x=>blocks[x].description&&blocks[x].description.length>0)});},
        owner: settingsDropdownContent
    });
    createButton({
        value: 'Exit',
        onclick: ()=>{close();},
        owner: settingsDropdownContent
    });
}

function menuButtonClicked(){
    runningDatabase = this.innerText;
    document.title = runningDatabase;
    toggleToMain();
    load();
    showDB();
}

let menuButtons = [];
function loadMenuButtons() {
    stopEditCollectionsListMode();

    menuButtons = [];
    menuButtonContainer.innerHTML = '';
    let files = fs.readdirSync(databasesFolder);
    files.forEach((file) => {
        let name = file.split('.');
        name = name.slice(0, name.length - 1).join('.');
        menuButtons.push(createButton({
            value: name,
            buttonClass: 'menu-databases-button',
            owner: menuButtonContainer,
            onclick: menuButtonClicked
        }));
    });
    menuButtons = menuButtons.filter(x=>x);
}

function toggleToMain(){
    container.className = 'main';
}

function toggleToMenu(){
    document.title = 'Pharmony';
    container.className = 'menu';
}

function openNewCollectionAdder(){
    new popup.PopupInputPanelBigCentral({
        headerText: 'Enter the new collection name',
        inputNames: ['Collection name'],
        buttons: [
            createButton({
                value: 'Done',
                onclick: function (panelObject) {
                    createDatabase(panelObject.inputs[0].value);
                    loadMenuButtons();
                }
            })
        ],
        owner: container
    });
}

function removeCollections(names) {
    for (let name of names) {
        fs.unlinkSync(databasesFolder+name+'.txt');
    }
    loadMenuButtons();
}

function loadMenu(){
    for (let node of menu.childNodes) {
        if (node !== menuButtonContainer) {
            node.remove();
        }
    }
    loadMenuButtons();
    newCollectionButton = createButton({
        value: 'New Collection',
        buttonClass: 'menu-generalButton menu-newCollectionButton',
        owner: menu,
        onclick: ()=>{
            openNewCollectionAdder();
        }
    });
    removeCollectionsButton = createButton({
        value: 'Remove Selected Collections',
        buttonClass: 'menu-generalButton menu-removeCollectionsButton',
        owner: menu,
        onclick: ()=>{
            console.log(removeCollectionsSelector.selectedElements);
            removeCollections(removeCollectionsSelector.selectedElements.map((x)=>{return x.innerText;}));
        }
    });
    removeCollectionsButton.style.display = 'none';
}

let removeCollectionsSelector;
function editCollectionsList(){
    removeCollectionsSelector = new Selector({elements: menuButtons});
    removeCollectionsSelector.start();
    newCollectionButton.style.display = 'none';
    removeCollectionsButton.style.display = 'block';
}

function stopEditCollectionsListMode(){
    if (!removeCollectionsSelector) return;
    ipcRenderer.send('stopEditCollectionsListMode');
    removeCollectionsSelector.stop();
    removeCollectionsSelector = undefined;
    newCollectionButton.style.display = 'block';
    removeCollectionsButton.style.display = 'none';
}

function load(){
    blocks = {};
    let data = fs.readFileSync(databasesFolder+runningDatabase+'.txt').toString().split('\n');
    for (let i of data) {
        if (i){
            let temp = JSON.parse(i);
            if (temp.name){
                blocks[temp.name] = temp;
            }
        }
    }
}

let createDatabase = popup.createResponsiveFunction({
    func: function (name) {
        if (!name || name.length == '') throw 'Invalid input.';
        if (!name.match(/[\s\S]\.txt/)) name += '.txt';
        if (fs.existsSync(databasesFolder + name)) throw 'Existing name';
        fs.writeFileSync(databasesFolder + name, '');
    },
    popupAlertPanel: popup.PopupAlertPanelSmall,
    errorInfo: 'error',
    successInfo: {
        text: 'Done.'
    }
});

function save(){
    let data = '';
    for (let name in blocks) {
        data += JSON.stringify(blocks[name])+'\n';
    }
    fs.writeFile(databasesFolder+runningDatabase+'.txt', data, function(){});
}

function showDB() {
    tableScrollAnchor = 'bottom';
    lastFind = undefined;
    let keys = new Set();
    for (let k in blocks) keys.add(k);
    return show(keys);
}

let lastFind;
function find(rawArg, mark=true, indices = true) {
    if (mark)
        lastFind = rawArg;
    if (!rawArg) return Object.keys(blocks);
    let argGroups = rawArg.split('|').map(x=>x.match(/(?:^|[&^!])[^!&^]+/g));
    let res = [];
    let index = 0;
    for (let name in blocks) {
        index++;
        let valid;
        for (let args of argGroups){
            valid = true;
            for (let arg of args) {
                switch(arg[0]) {
                    case '&':
                        if (!name.includes(arg.slice(1))){
                            valid = false;
                        }
                        break;
                    case '^':case '!':
                        if (name.includes(arg.slice(1))) {
                            valid = false;
                        }
                        break;
                    default:
                        if (!name.includes(arg)) {
                            valid = false;
                        }
                        break;
                }
                if (!valid){
                    break;
                }
            }
            if (valid) break;
        }
        if (!valid) continue;
        if(indices)
            res.push([index, name]);
        else
            res.push(name);
    }
    return res;
}

function checkIfLastFindIncludesThese(names) {
    let lastFindRes = find(lastFind, mark=false, indices = false);
    for (let name of names) {
        if (!lastFindRes.includes(name)) {
            return false;
        }
    }
    return true;
}

function clearTable() {
    table.innerHTML = '';
}

function getNotExistingName(info){
    let name = info.name, extension = info.extension;
    let tempName = name, index = 1;
    if (extension.length>0 && extension[0]!='.') extension = '.'+extension;
    while (fs.existsSync(name+extension)) {
        name = tempName + ' - ' + index++;
    }
    return {name: name, extension: extension};
}

let lastCreatedFile;
function exportToDocx (config) {
    let doc = new docx.Document();
    if (!config.mode || config.mode == 'standart'){
        for (let key of config.keys) {
            let text = new docx.TextRun(key);
            text.font('Segoe UI');
            let par = new docx.Paragraph().addRun(text);
            doc.addParagraph(par);
        }
        let exporter = new docx.LocalPacker(doc);
        let info = getNotExistingName({
            name: runningDatabase,
            extension: '.docx'
        });
        exporter.pack(info.name);
        lastCreatedFile = info.name;
    } else if (config.mode == 'full'){
        let table = doc.createTable(config.keys.length, 2);
        let rowIndex = 0;
        for (let key of config.keys) {
            let text = new docx.TextRun(key);
            text.font('Segoe UI');
            table.getCell(rowIndex, 0).addContent(new docx.Paragraph().addRun(text));
            if (blocks[key].description.includes(';')) {
                let lineIndex = 1;
                for (let line of blocks[key].description.split(';')) {
                    text = new docx.TextRun((clearAdditionalSpaces(line)[0]!='#'?`${lineIndex++}. `:'')+`${clearAdditionalSpaces(line)}`);
                    text.font('Segoe UI');
                    table.getCell(rowIndex, 1).addContent(new docx.Paragraph().addRun(text));
                }
            } else {
                text = new docx.TextRun(blocks[key].description);
                text.font('Segoe UI');
                table.getCell(rowIndex, 1).addContent(new docx.Paragraph().addRun(text));
            }
            rowIndex++;
        }
        let exporter = new docx.LocalPacker(doc);
        let info = getNotExistingName({
            name: runningDatabase,
            extension: '.docx'
        });
        exporter.pack(info.name);
        lastCreatedFile = info.name;
    } else {
        throw `Invalid mode ${config.mode}.`;
    }
    return true;
}

let responsiveExport = popup.createResponsiveFunction({
    func: exportToDocx,
    startInfo: {text: 'Starting export.'},
    successInfo: {text: 'Done exporting.', onclick: ()=>{launch.launch(lastCreatedFile+'.docx');}},
    errorInfo: 'error',
    popupAlertPanel: popup.PopupAlertPanelSmall
});

function exporterFromInput(attr) {
    let [glob, name, extension] = attr.match(/^(?:(?:to|as) ([^.\n]+)(?:(\.\w+)|)|)$/);
    if (glob==undefined) {
        return false;
    }
    if (!name) name = runningDatabase+' - export';
    if (!extension) extension = '.txt';
    let info = getNotExistingName({name: name, extension: extension});
    name = info.name;
    extension = info.extension;
    let data = '';
    for (let block in blocks) {
        if (block)
            data += block+"\n";
    }
    fs.writeFileSync(name+extension, data);
    return true;
}

let lastIDnames;
function show(IDnames) {
    changedBlockNames = [];
    changeFindTo = undefined;
    lastIDnames = IDnames;
    clearTable();
    let headersRow = document.createElement('tr');
    table.appendChild(headersRow);
    let headers = new Set();

    let tempH = document.createElement('th');
    tempH.innerHTML = 'ID';
    tempH.id = 'tableHeader-ID';
    headersRow.appendChild(tempH);
    tempH = document.createElement('th');
    tempH.innerHTML = 'Name';
    tempH.id = 'tableHeader-Name';
    headersRow.appendChild(tempH);
    tempH = document.createElement('th');
    tempH.innerHTML = 'Description';
    tempH.id = 'tableHeader-Description';
    headersRow.appendChild(tempH);

    let keys = Object.keys(blocks);
    let tempIndex = 1;
    for (let IDname of IDnames) {
        if (!IDname) continue;
        let [ID, name] = (typeof IDname == 'string'?[tempIndex++, IDname]:IDname);
        let tempRow = document.createElement('tr');
        let tempD = document.createElement('td');
        tempD.innerHTML = ID;
        tempRow.appendChild(tempD);
        
        tempD = document.createElement('td');
        tempD.className = 'tableElement-Name';
        tempD.innerHTML = blocks[name].name;
        tempRow.appendChild(tempD);

        tempD = document.createElement('td');
        tempD.className = 'tableElement-Description';
        tempD.innerHTML = `<ol class='table-lists'>${blocks[name].description.split(';').map((elem, index, array)=>{return (array.length>1?(clearAdditionalSpaces(elem)[0]!='#'?`<li>${clearAdditionalSpaces(elem)}</li>`:`<b>${clearAdditionalSpaces(elem).slice(1)}</b>`):`<div>${clearAdditionalSpaces(elem)}</div>`);}).join('')}</ol>`;
        tempRow.appendChild(tempD);

        tempRow.addEventListener('dblclick', (event) => {
            input.value = `${blocks[name].name} -- ${blocks[name].description}`;
        });
        if (tempRow.innerHTML)
            table.appendChild(tempRow);
    }
    refreshScrollLevel();
    return true;
}

const specialSymbols = [
    ';',
    '\n'
];
function clearAdditionalSpaces(text){
    if (!text) return text;
    let lastWasSpace = true;
    let res = '';
    for (let i in text){
        if (text[i]==' ') {
            if (lastWasSpace) continue;
            else {
                lastWasSpace = true;
                res+=text[i];
                continue;
            }
        }
        if (specialSymbols.includes(text[i])){
            if (lastWasSpace && res && !specialSymbols.includes(res[res.length-1])) {res = res.slice(0, res.length-1);}
            lastWasSpace = true;
        }else lastWasSpace = false;
        res+=text[i];
    }
    if (res[res.length-1] == ' '){
        res = res.slice(0, res.length-1);
    }
    return res;
}

let commands = {
    show: popup.createResponsiveFunction({
        func: showDB,
        popupAlertPanel: popup.PopupAlertPanelSmall,
        successInfo: {text: 'Done.'},
        errorInfo: {text: 'Error.'}
    }),
    export: popup.createResponsiveFunction({
        func: exporterFromInput,
        popupAlertPanel: popup.PopupAlertPanelSmall,
        successInfo: {text: 'Done.'},
        errorInfo: {text: 'Error.'}
    })
};

let specialKeyWordBlockNames = {
    checkpoint: {
        show: function (description) {
            let res = '';
            let tempD = document.createElement('td');
            tempD.innerHTML = `<b>#:</b>`;
            res += tempD.outerHTML;
            tempD = document.createElement('td');
            tempD.innerHTML = `<b>${description}</b>`;
            res += tempD.outerHTML;
            return res;
        },
        create: function (name, attr, val) {
            let checkName = `${name} - ${val}`;
            if (blocks[checkName]) throw 'Existing checkpoint name.';
            blocks[checkName] = {
                name: checkName,
                description: val // So the name of checkpoint is in it's block's description
            };
            save();
            showDB();
        },
        remove: function (name, attr, val) {
            if (!val) throw 'Invalid checkpoint name';
            let checkName = `${name} - ${val}`;
            delete blocks[checkName];
            save();
            showDB();
        }
    }
};

let lastKey;
let lastEdit;
let editBlock = popup.createResponsiveFunction({
    func: function ({ key, newValue }) {
        if (blocks[key].description == newValue){
            return;
        }
        lastKey = key;
        lastEdit = blocks[key].description;
        blocks[key].description = newValue;
        save();
    },
    popupAlertPanel: popup.PopupAlertPanelSmall,
    successInfo: {
        text: 'Undo.',
        onclick: () => {
            blocks[lastKey].description = lastEdit;
            save();
            show(find(lastFind));
        }
    },
    successLogic: ({ key, newValue })=>{return blocks[key] && blocks[key].description != newValue;},
    errorInfo: 'error'
});

let changedBlockNames = [];
let changeFindTo;
function createOrEditBlocks(name, newValue){
    if (!name) throw 'Invalid name';
    if (name.endsWith('*')) {
        name = name.slice(0,name.length-1);
        find(name, false, false).forEach((value, index, array)=>{
            // blocks[value].description = newValue;
            editBlock({key: value, newValue: newValue});
        });
    } else {
        if (blocks[name]) editBlock({key: name, newValue: newValue});
        else {blocks[name] = {name: name, description: newValue}; changedBlockNames.push(name);}
    }
}

function removeBlocks(name, newValue){
    if (!name) throw 'Invalid name';
    if (name.endsWith('*')) {
        name = name.slice(0,name.length-1);
        find(name, false, false).forEach((value, index, array)=>{
            delete blocks[value];
        });
    } else {
        if (blocks[name]) delete blocks[name];
    }
}

function addToBlocks(name, newValue){
    if (!name) throw 'Invalid name';
    if (name.endsWith('*')) {
        name = name.slice(0,name.length-1);
        find(name, false, false).forEach((value, index, array)=>{
            if (!blocks[value].description.match(new RegExp(`(;|^)${newValue}(;|$)`))) {blocks[value].description += (blocks[value].description?';':'')+newValue;changedBlockNames.push(value);}
        });
    } else {
        if (blocks[name] && !blocks[name].description.match(new RegExp(`(;|^)${newValue}(;|$)`))) {blocks[name].description += (blocks[name].description?';':'')+newValue;changedBlockNames.push(name);}
    }
}

function removeFromBlocks(name, newValue){
    if (!name) throw 'Invalid name';
    if (name.endsWith('*')) {
        name = name.slice(0,name.length-1);
        find(name, false, false).forEach((value, index, array)=>{
            if (blocks[value].description.includes(newValue)){
                if (blocks[value].description.includes(';'+newValue+';')){ // Check the memory to be without spaces after ;
                    blocks[value].description = blocks[value].description.replace(`;${newValue};`, ';');
                    changedBlockNames.push(value);
                } else {
                    let temp = blocks[value].description;
                    blocks[value].description = blocks[value].description.replace(new RegExp(';'+newValue+'$'), '').replace(new RegExp('^'+newValue+';'), '').replace(new RegExp('^'+newValue+'$'), '');
                    if (temp!=blocks[value].description) changedBlockNames.push(value);
                }
            }
        });
    } else {
        if (blocks[name].description.includes(newValue)){
            if (blocks[name].description.includes(';'+newValue+';')){ // Check the memory to be without spaces after ;
                blocks[name].description = blocks[name].description.replace(`;${newValue};`, ';');
                changedBlockNames.push(name);
            } else {
                let temp = blocks[name].description;
                blocks[name].description = blocks[name].description.replace(new RegExp(';'+newValue+'$'), '').replace(new RegExp('^'+newValue+';'), '').replace(new RegExp('^'+newValue+'$'), '');
                if (temp != blocks[name].description) changedBlockNames.push(name);
            }
        }
    }
}

function renameBlocks(name, newValue){
    if (!name) throw 'Invalid name';
    if (name.endsWith('*')) throw "You can't use * in rename function";
    if (!newValue) throw 'Invalid newName';
    if (blocks[newValue]) throw 'Existing element with newName';
    blocks[newValue] = blocks[name];
    blocks[newValue].name = newValue;
    delete blocks[name];
    // changedBlockNames.push(newValue);
    changeFindTo = newValue;
}

const keys = {
    '--': createOrEditBlocks, // Creates or edits the block
    '--/': removeBlocks, // Removes the block
    '--+': addToBlocks, // Adds given line to the block's description if can't find it there
    '---': removeFromBlocks, // Removes given line from block's description if can find it there 
    '-->': renameBlocks // Renames the block
};

function inputSlicer(command){
    return command.match(/^((?:[^\n]+)(?:[^-]))(--(?:(?:\/)|(?:\+)|(?:-)|(?:\>)|(?:)))([^\n]*)$/);
}

let process = popup.createResponsiveFunction({
    func: (command)=>{
        let resp = inputSlicer(command);
        if (resp) {
            let [, name, key, newValue] = resp.map(x=>clearAdditionalSpaces(x));
            keys[key](name, newValue);
            save();
            if (lastFind){
                if (changeFindTo) {
                    show(find(changeFindTo));
                } else {
                    let lastFindRes = find(lastFind, false, false);
                    if (lastFindRes.length || !lastIDnames.length){ // Checking if all elements of last scope were deleted
                        let valid = true;
                        for (let chName of changedBlockNames){
                            if (!lastFindRes.includes(chName)) {
                                show(find(name));
                                valid = false;
                                break;
                            }
                        }
                        if (valid) {
                            show(find(lastFind));
                        }
                    } else {
                        showDB();
                    }
                }
            } else {
                showDB();
            }
        } else {
            if (command)
                show(find(command));
            else
                showDB();
        }
    },
    errorInfo: 'error',
    popupAlertPanel: popup.PopupAlertPanelSmall
});

function openDetailedMode() {
    let resp = inputSlicer(input.value);
    new popup.PopupInputPanelBigCentral({ // Creating the editor window
        headerText: 'Editor',
        inputNames: ['Name', '*textDescription'],
        finishFunction: (panel) => {
            if (!resp) resp = ['', input.value, '', ''];
            let [glob, name, key, val] = resp;
            name = clearAdditionalSpaces(name);
            key = clearAdditionalSpaces(key);
            val = clearAdditionalSpaces(val);
            let inputs = panel.inputs;
            inputs[0].value = name;
            inputs[1].value = clearAdditionalSpaces(val.replace(/;/g, ';\n'));
        },
        buttons: [
            createButton({
                value: 'Done',
                onclick: (panel) => {
                    input.value = `${panel.inputs[0].value} -- ${clearAdditionalSpaces(panel.inputs[1].value).replace(/;\n/g, ';').replace(/\n/g, ';')}`;
                    process(input.value);
                }
            })
        ],
        owner: container,
        onclose: (panel)=>{input.value = `${panel.inputs[0].value} -- ${clearAdditionalSpaces(panel.inputs[1].value).replace(/;\n/g, ';').replace(/\n/g, ';')}`;}
    });
}

function init() {
    ipcRenderer.send('started');
    input.addEventListener('keydown', (event)=>{ // Responding to enter
        if (event.keyCode == '13') {
            if (input.value) process(input.value);
            else showDB();
            input.select();
        }
    });
    
    document.addEventListener('keyup', (event)=>{ // Responding to Esc button
        if (event.keyCode == '27') {
            if (removeCollectionsSelector){
                stopEditCollectionsListMode();
            }else if (popup.runningPopup()) {
                popup.removeRunningPopup();
            }
            else
                toggleToMenu();
        }
    });

    ipcRenderer.on('edit-collections-list-clicked', ()=>{ // Will allow to remove collections in the future
        editCollectionsList();
    });
    ipcRenderer.on('add-new-collection-clicked', openNewCollectionAdder);
    ipcRenderer.on('back-to-menu-clicked', stopEditCollectionsListMode);
    table.parentElement.addEventListener('scroll', (event)=>{ // Scroll anchors
        if (table.parentElement.scrollTop+table.parentElement.clientHeight == table.parentElement.scrollHeight) tableScrollAnchor = 'bottom';
        else if (table.parentElement.scrollTop == 0) tableScrollAnchor = 'top';
        else tableScrollAnchor = undefined;
    });
    detailsButton.addEventListener('click', () => { // Opening editor when clicking to the button
        openDetailedMode();
    });
    settingsCreator(); // Creating settings panel
    loadMenu(); // Creating menu
}

window.onload = init; // Starting the program


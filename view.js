/* jshint esversion: 6 */
const fs = require('fs');
const docx = require('docx');
const popup = require('./popup');
const launch = require('./launchFiles');
const {ipcRenderer} = require('electron');
const Selector = require('./selector');
const Examination = require('./Examination/examination');
const {createButton} = require('./Universals');

let data = {};
let blocks = {};
const databasesFolder = 'Databases/';
let runningDatabase = '';
let container = document.getElementById('container');
let menu = document.getElementById('menu');
let menuButtonContainer = document.getElementById('menu-buttonContainer');
let table = document.getElementById('table');
let input = document.getElementById('input');
let settingsDropdownContent = document.getElementById('settings-dropdown-content');
let detailsButton = document.getElementById('details-button');
let newCollectionButton, removeCollectionsButton;
const examination = document.getElementById('examination');

let tableScrollAnchor = 'bottom';

const standardDataTemplate = {
    data: {},
    global: {}
},
    standardBlockTemplate = {
        description: '',
        individual: {}
    };

function refreshScrollLevel(){
    if (tableScrollAnchor == 'top') {
        table.parentElement.scrollTo(0,0);
    } else if (tableScrollAnchor == 'bottom') {
        table.parentElement.scrollTo(0,table.parentElement.scrollHeight-table.parentElement.clientHeight);
    }
}



function settingsCreator() {
    createButton({
        value: 'Examinate',
        onclick: () => { startExamination(); },
        owner: settingsDropdownContent
    });
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

// Menu stuff
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
        let extension = name[name.length-1];
        name = name.slice(0, name.length - 1).join('.');
        if (name && extension == 'json'){
            menuButtons.push(createButton({
                value: name,
                buttonClass: 'menu-databases-button',
                owner: menuButtonContainer,
                onclick: menuButtonClicked
            }));
            runningDatabase = name;
        }
    });
    menuButtons = menuButtons.filter(x=>x);
}

function toggleToMain(){
    container.className = 'main';
}

function toggleToMenu(){
    clearTable();
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
            }),
            createButton({
                value: 'Close',
                onclick: function (panelObject) {
                    panelObject.close();
                }
            })
        ],
        owner: container
    });
}

function removeCollections(names) {
    for (let name of names) {
        fs.unlinkSync(databasesFolder+name+'.json');
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

// Data manipulations
function load(){
    data = JSON.parse(fs.readFileSync(databasesFolder+runningDatabase+'.json').toString());
    blocks = data.blocks;
}

function save(){
    fs.writeFile(databasesFolder+runningDatabase+'.json', JSON.stringify(data), function(){});
}

let createDatabase = popup.createResponsiveFunction({
    func: function (name) {
        if (!name || name.length == '') throw 'Invalid input.';
        if (!name.match(/[\s\S]\.json/)) name += '.json';
        if (fs.existsSync(databasesFolder + name)) throw 'Existing name';
        fs.writeFileSync(databasesFolder + name, JSON.stringify(standardDataTemplate));
    },
    popupAlertPanel: popup.PopupAlertPanelSmall,
    errorInfo: 'error',
    successInfo: {
        text: 'Done.'
    }
});

// Table creation and finding
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

function clearTable() {
    table.innerHTML = '';
}

let lastIDnames;
function show(IDnames) {
    changedBlockNames = [];
    changeFindTo = undefined;
    lastIDnames = IDnames;
    clearTable();
    let headersRow = document.createElement('tr');
    headersRow.className = "headerRow";
    table.appendChild(headersRow);

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

    let tempIndex = 1;
    for (let IDname of IDnames) {
        if (!IDname) continue;
        let [ID, name] = (typeof IDname == 'string' ? [tempIndex++, IDname] : IDname);
        let tempRow = document.createElement('tr');
        let tempD = document.createElement('td');
        tempD.innerHTML = ID;
        tempRow.appendChild(tempD);

        tempD = document.createElement('td');
        tempD.className = 'tableElement-Name';
        tempD.innerHTML = name;
        tempRow.appendChild(tempD);

        tempD = document.createElement('td');
        tempD.className = 'tableElement-Description';
        let descrBlocks = blocks[name].description.split(";");
        if (descrBlocks.length > 1)
            tempD.innerHTML = `<ol class='table-lists'>${descrBlocks.map((elem) => { return elem[0] != '#' ? `<li>${elem}</li>` : `<b>${elem.slice(1)}</b>`; }).join("")}</ol>`;
        else
            tempD.innerHTML = `<div class='table-element'>${descrBlocks[0]}</div>`;
        tempRow.appendChild(tempD);

        tempRow.addEventListener('dblclick', (event) => {
            input.value = `${name} -- ${blocks[name].description}`;
        });
        if (tempRow.innerHTML)
            table.appendChild(tempRow);
    }
    refreshScrollLevel();
    return true;
}

// Exporting content
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
                    line = standardizeText(line);
                    text = new docx.TextRun((line[0]!='#'?`${lineIndex++}. `:'')+`${line}`);
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

const specialSymbols = {
    '': ['^\\s+','\\s+$'],
    ';': [';\\n', ';\\r', '\\n', '\\r'],
    ' ': ['\\s+']
};

function standardizeText(text) {
    for (let symb in specialSymbols) {
        text = text.replace(new RegExp(specialSymbols[symb].map((x) => `(${x})`).join("|"), 'g'), symb);
    }
    return text;
}

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

// Block manipulations
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
            editBlock({key: value, newValue: newValue});
        });
    } else {
        if (blocks[name]) editBlock({key: name, newValue: newValue});
        else {blocks[name] = Object(standardBlockTemplate); blocks[name].description = newValue; changedBlockNames.push(name);}
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
    let keys = Object.keys(blocks);
    let newBlocks = {}; // Creating new blocks dictionary and initializing it one by one
    for (let key of keys) {
        if (key == name) { // Doing this to avoid rearrangement of elements
            newBlocks[newValue] = blocks[name];
        }else 
            newBlocks[key] = blocks[key];
    }
    data.blocks = newBlocks;
    blocks = data.blocks;
    changeFindTo = newValue;
}

const keys = {
    '--': createOrEditBlocks, // Creates or edits the block
    '--/': removeBlocks, // Removes the block
    '--+': addToBlocks, // Adds given line to the block's description if can't find it there
    '---': removeFromBlocks, // Removes given line from block's description if can find it there 
    '-->': renameBlocks // Renames the block
};

function inputSlicer(command){ // Will give you content from the input panel
    return command.match(/^((?:[^\n]+)(?:[^-]))(--(?:(?:\/)|(?:\+)|(?:-)|(?:\>)|(?:)))([^\n]*)$/);
}

let process = popup.createResponsiveFunction({ // creating responsive process method
    func: (command)=>{
        let resp = inputSlicer(command);
        if (resp) {
            let [, name, key, newValue] = resp.map(x=>standardizeText(x));
            if (name.includes(';')){
                name = name.split(';');
                for (let curr of name) {
                    if (curr)
                        keys[key](curr, newValue);
                }
            }else 
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

// Editor stuff
let Editor;
function initEditor(){ // Will initialize the editor window
    Editor = new popup.PopupInputPanelBigCentral({ // Creating the editor window
        headerText: 'Editor',
        inputNames: ['Name', '*textDescription'],
        buttons: [
            createButton({
                value: 'Done',
                onclick: (panel) => {
                    if (panel.inputs[0].value || standardizeText(panel.inputs[1].value)) {
                        input.value = `${panel.inputs[0].value} -- ${standardizeText(panel.inputs[1].value)}`;
                        process(input.value);
                    }
                }
            }),
            createButton({
                value: 'Erase',
                onclick: (panel) => {
                    for (let i = 0; i < panel.inputs.length; i++) {
                        panel.inputs[i].value = "";
                    }
                }
            }),
            createButton({
                value: 'Close',
                onclick: (panel) => {
                    panel.close();
                }
            })
        ],
        owner: container,
        onclose: (panel) => {
            if (panel.inputs[0].value || standardizeText(panel.inputs[1].value))
                input.value = `${panel.inputs[0].value} -- ${standardizeText(panel.inputs[1].value)}`;
        },
        initialState: "hidden"
    });
}

function openEditor() { // Will show the editor
    let resp = inputSlicer(input.value);
    Editor.openingFunction = (panel) => { // setting the editor content
        if (!resp) resp = ['', input.value, '', ''];
        else resp = resp.map(x => standardizeText(x));
        let [, name, key, val] = resp;
        let inputs = panel.inputs;
        inputs[0].value = name;
        inputs[1].value = val.split(';').map(x => standardizeText(x)).join(';\n');
    };
    Editor.show(); // opening the editor
}

// Examination stuff
function startExamination() {
    clearTable();
    Examination.start(data);
    show(lastIDnames);
}

function reformBlocks(template) {
    for (let blockName in blocks) {
        for (let currentKey in template) {
            blocks[blockName][currentKey] = blocks[blockName][currentKey] || template[currentKey];
        }
    }
}

function reformBlocksWithRemove(template) {
    for (let blockName in blocks) {
        tempBlock = blocks[blockName];
        blocks[blockName] = {};
        for (let currentKey in template) {
            blocks[blockName][currentKey] = tempBlock[currentKey] || template[currentKey];
        }
    }
}

function reformData(template) {
    for (let currentKey in template) {
        data[currentKey] = data[currentKey] || template[currentKey];
    }
}

function init() {
    ipcRenderer.send('started');
    input.addEventListener('keydown', (event)=>{ 
        switch (event.keyCode) {
        case 13: // Responding to enter
            if (input.value) process(input.value);
            else showDB();
            input.select();
            break;
        case 9: // Responding to tab
            event.preventDefault();
            openEditor();
            break;
        }
    });
    
    document.addEventListener('keyup', (event)=>{ 
        switch (event.keyCode) {
            case 32: // Responding to space keyup
                const flashcards = examination.getElementsByClassName('flashcard');
                if (flashcards) {
                    const flashcard = flashcards[0];
                    if (flashcard.className == 'flashcard front')
                        flashcard.className = 'flashcard both';
                    else
                        Examination.getRunningExamination().next();
                }
                break;
            case 27: // Responding to Esc button
                if (removeCollectionsSelector){
                    stopEditCollectionsListMode();
                }else if (popup.runningPopup()) {
                    popup.removeRunningPopup();
                }
                else {
                    switch (container.className){
                        case 'examination':
                        if (examination.getElementsByClassName('flashcard').length > 0) {
                            Examination.toggleToIntroduction();
                        }
                        else Examination.toggleToModeSelection();
                        break;
                        case 'examination-mode-selection':
                        Examination.stop();
                        break;
                        case 'main':
                        toggleToMenu();
                        break;
                        case 'menu':
                        break;
                    }
                }
        }
    });

    ipcRenderer.on('edit-collections-list-clicked', () => { // Will allow to remove collections in the future
        toggleToMenu(); // If you are currently in the viewer, then this will toggle to the menu, to allow you edit collections list
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
        openEditor();
    });
    settingsCreator(); // Creating settings panel
    loadMenu(); // Creating menu
    initEditor(); // Initializing editor object once
}

window.onload = init; // Starting the program


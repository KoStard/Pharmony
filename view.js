/* jshint esversion: 6 */

module.exports = {
    save: save
};

const fs = require('fs');
const docx = require('docx');
const popup = require('./popup');
const launch = require('./launchFiles');
const {ipcRenderer} = require('electron');
const Selector = require('./selector');
const Examination = require('./Examination/examination');
const ExaminationUniversals = require('./Examination/examinationUniversals');
const standardFlashcards = require('./Examination/standardFlashcards');
const { createButton } = require('./Universals');
const Mousetrap = require('./mousetrap.min.js');
const LPgen = require('./LanguagePacks/language-pack-generator');
const textToColor = require('./Colors/text-to-color');
const colorFuncs = require('./Colors/colorFuncs');

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
    blocks: {},
    global: {
        standardFlashcards: {},
    }
},
    standardBlockTemplate = {
        description: '',
        individual: {
            standardFlashcards: {
                lastSequence: [],
                last: ''
            },
        }
    };

function refreshScrollLevel(){
    if (tableScrollAnchor == 'top') {
        table.parentElement.scrollTo(0,0);
    } else if (tableScrollAnchor == 'bottom') {
        table.parentElement.scrollTo(0,table.parentElement.scrollHeight-table.parentElement.clientHeight);
    }
}


let MultiSelectionButton,
MultiSelectionButtonEnum = Object.freeze({
    default: 'MultiSelection',
    cancel: 'Done'
});
function settingsCreator() {
    MultiSelectionButton = createButton({
        value: MultiSelectionButtonEnum.default,
        onclick: function () {
            if (this.innerText == MultiSelectionButtonEnum.default){
                switchToMultiSelectionMode();
            } else if (this.innerText == MultiSelectionButtonEnum.cancel) {
                switchToNormalViewerMode();
            }
        },
        owner: settingsDropdownContent
    });
    createButton({
        value: 'Examinate',
        onclick: () => { startExamination(); },
        owner: settingsDropdownContent
    });
    createButton({
        value: 'Global',
        onclick: () => { 
            if (inputMode == 'global') {
                toggleToMain();
                onGlobalModeClosing && onGlobalModeClosing();
                onGlobalModeClosing = undefined;
            }else {
                inputMode = 'global';
                globalSearch(standardizeText(input.value), false);
                document.title = "Global Search";
            }
        },
        owner: settingsDropdownContent
    });
    createButton({
        value: 'Global with descriptions',
        onclick: () => {
            if (inputMode == 'global-with-descriptions') {
                toggleToMain();
                onGlobalModeClosing && onGlobalModeClosing();
                onGlobalModeClosing = undefined;
            } else {
                inputMode = 'global-with-descriptions';
                globalSearch(standardizeText(input.value), true);
                document.title = "Global Search With Desciption";
            }
        },
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
        }
    });
    menuButtons = menuButtons.filter(x=>x);
}

// Marker of being in global search or not
let inputMode = 'standard';


// Toggling to main viewer
function toggleToMain(inputMode_local = "standard"){
    container.className = 'main';
    inputMode = inputMode_local;
    switch (inputMode_local) {
        case "standard":
        headersRowColor = '';
        break;
        case "global":
        headersRowColor = '#f44336';
        break;
        case "global-with-descriptions":
        headersRowColor = '#b71c1c';
        break;
    }
}

function toggleToMenu(){
    clearTable();
    document.title = 'Pharmony';
    container.className = 'menu';
}

function toggleToCollection(coll){
    toggleToMain();
    document.title = coll;
    runningDatabase = coll;
    onGlobalModeClosing = undefined;
    load();
    showDB();
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
    removeCollectionsSelector.init(globals);
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
    fs.writeFileSync(databasesFolder+runningDatabase+'.json', JSON.stringify(data), function(){});
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

// Viewer stuff
function clearSelection() {
    if (window.getSelection) { window.getSelection().removeAllRanges(); }
    else if (document.selection) { document.selection.empty(); }
}
let MultiSelector;
let MultiSelectorData = {
    lastKey: '--',
    lastNewValue: ''
};
function switchToMultiSelectionMode(){
    MultiSelectionButton.innerText = MultiSelectionButtonEnum.cancel;
    MultiSelector = new Selector({
        elements: Array.from(table.childNodes).slice(1), // Еxcluding headers from selection
        selectedColor: '#e0e0e0',
        unselectedColor: 'none',
        hoverColor: '#ebebeb'
    });
    MultiSelector.init(globals);
    MultiSelector.start();
    if (!standardizeText(input.value)) return;
    let resp = inputSlicer(input.value);
    let name, key, newValue;
    if (resp)
        [, name, key, newValue] = (resp).map(x => standardizeText(x));
    else{
        name = input.value;
    }
    if (!name) return;
    if (name.includes(';')) name = name.split(";");
    else name = [name];
    for (let curr of Array.from(table.childNodes).filter((el) => name.includes(el.childNodes[1].innerText))) {
        MultiSelector.selectElement(curr);
    }
    MultiSelectorData.lastKey = (key||'--');
    MultiSelectorData.lastNewValue = newValue;
}

function switchToNormalViewerMode(){
    MultiSelectionButton.innerText = MultiSelectionButtonEnum.default;
    input.value = MultiSelector.selectedElements.map(row=>row.childNodes[1].innerText).join(';')+MultiSelectorData.lastKey+MultiSelectorData.lastNewValue;
    MultiSelector.stop();
    MultiSelector = undefined;
    MultiSelectorData.lastKey = '--';
    MultiSelectorData.lastNewValue = '';
}

// Table creation and finding
function showDB() {
    tableScrollAnchor = 'bottom';
    lastFind = undefined;
    let keys = new Set();
    for (let k in blocks) keys.add(k);
    return show(keys, blocks);
}

let lastFind;
function find(rawArg, mark=true, indices = true, withDescription = false) {
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
                        if (!name.includes(arg.slice(1)) && !(withDescription && blocks[name].description.includes(arg.slice(1)))) {
                            valid = false;
                        }
                        break;
                    case '^':case '!':
                        if (name.includes(arg.slice(1)) || (withDescription && blocks[name].description.includes(arg.slice(1)))) {
                            valid = false;
                        }
                        break;
                    default:
                        if (!name.includes(arg) && !(withDescription && blocks[name].description.includes(arg))) {
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
let headersRowColor;
function show(IDnames, blocks) {
    changedBlockNames = [];
    changeFindTo = undefined;
    if (inputMode == 'standard')
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

    if (headersRowColor) {
        headersRow.style.background = headersRowColor;
    }

    if (inputMode == 'global' || inputMode == 'global-with-descriptions') {
        tempH = document.createElement('th');
        tempH.innerHTML = 'Collection';
        tempH.id = 'tableHeader-DBName';
        headersRow.appendChild(tempH);
    }

    let tempIndex = 1;
    for (let IDname of IDnames) {
        if (!IDname) continue;
        let [ID, name] = (typeof IDname == 'string' ? [tempIndex++, IDname] : IDname);
        let tempName = name;
        if (inputMode == 'global' || inputMode == 'global-with-descriptions') {
            name = blocks[name].name;
        }
        if (!name || !tempName)
            return;
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
        let descrBlocks = blocks[tempName].description.split(";");
        if (descrBlocks.length > 1)
            tempD.innerHTML = `<ol class='table-lists'>${descrBlocks.map((elem) => { return elem[0] != '#' ? `<li>${elem}</li>` : `<b>${elem.slice(1)}</b>`; }).join("")}</ol>`;
        else
            tempD.innerHTML = `<div class='table-element'>${descrBlocks[0]}</div>`;
        tempRow.appendChild(tempD);
        tempRow.addEventListener('mousedown', (event)=>{
            clearSelection();
        });

        if (inputMode == 'global' || inputMode == 'global-with-descriptions') {
            tempD = document.createElement('td');
            tempD.className = 'tableElement-DBName';
            tempD.innerHTML = blocks[tempName].collection;
            tempD.style.background = textToColor(blocks[tempName].collection, LPgen);
            tempD.style.color = colorFuncs.getWhiteOrBlackMaxContrast(tempD.style.background);

            tempD.addEventListener('dblclick', ()=>{
                toggleToCollection(blocks[tempName].collection);
            });

            tempRow.appendChild(tempD);
        }

        if (inputMode == 'standard')
            tempRow.addEventListener('dblclick', (event) => {
                event.preventDefault();
                if (event.shiftKey){ // Adding to existing one
                    let tempName, key = '--', newValue;
                    if (standardizeText(input.value)) {
                        let resp = inputSlicer(input.value);
                        if (resp)
                            [, tempName, key, newValue] = (resp).map(x => standardizeText(x));
                        else {
                            tempName = input.value;
                        }
                    }
                    if (tempName){
                        if (tempName.includes(';')) tempName = tempName.split(";");
                        else tempName = [tempName];
                        if (!tempName.includes(name))
                            input.value = `${tempName};${name} ${key} ${newValue}`;
                    } else {
                        input.value = `${name} ${key} ${blocks[tempName].description}`;
                    }
                } else 
                    input.value = `${name} -- ${blocks[tempName].description}`;
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

// Text manipulations
const specialSymbols = {
    '': ['^\\s+','\\s+$'],
    ';': [';\\n', ';\\r', '\\n', '\\r'],
    ' ': ['\\s+']
};

function standardizeText(text) {
    if (!text) return text;
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
            show(find(lastFind), blocks);
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
                    show(find(changeFindTo), blocks);
                } else {
                    let lastFindRes = find(lastFind, false, false);
                    if (lastFindRes.length || !lastIDnames.length){ // Checking if all elements of last scope were deleted
                        let valid = true;
                        for (let chName of changedBlockNames){
                            if (!lastFindRes.includes(chName)) {
                                show(find(name), blocks);
                                valid = false;
                                break;
                            }
                        }
                        if (valid) {
                            show(find(lastFind), blocks);
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
                show(find(command), block, blockss);
            else
                showDB();
        }
    },
    errorInfo: 'error',
    popupAlertPanel: popup.PopupAlertPanelSmall
});

// Editor stuff
let Editor;
function initEditor(){ // Will initiali, blocksze the editor window
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
    Editor.show(); // opening the edit, blocksor
}

// Examination stuff
function startExamination() {
    clearTable();
    Examination.start(data);
    show(lastIDnames, blocks);
}

// Data reforms
function reformBlocks(template, blocks) {
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

function doForAllDBs(f) {
    let wasOpened = runningDatabase;
    let files = fs.readdirSync(databasesFolder);
    files.forEach((filename) => {
        filename = filename.split('.')
        if (filename[1] == 'json'){
            filename = filename[0];
            runningDatabase = filename;
            load();
            f();
            save();
        }
    });
    if (wasOpened) {
        runningDatabase = wasOpened;
        load();
        showDB();
    } else {
        data = {};
    }
}

function reformAllCorrespondingToStandards(){ // Is being called from devtools
    doForAllDBs(() => {
        reformBlocks(standardBlockTemplate);
        reformData(standardDataTemplate);
    });
}

const globals = {
    save: save,
    capturingObjects: []
};
//---------------------------------------------------------------------------------------------------------
// Global search
let onGlobalModeClosing; // function that will be called when toggling to menu
function globalSearch(query, withDescription){
    let wasOpened = runningDatabase;
    let files = fs.readdirSync(databasesFolder);
    let res = {};
    if (!query) {
        toggleToMain(withDescription ? "global-with-descriptions" : "global");
        show(Object.keys(res), res);
        if (wasOpened) {
            onGlobalModeClosing = () => {
                toggleToCollection(wasOpened);
            };
        }
        return;
    }
    files.forEach((filename) => {
        filename = filename.split('.');
        if (filename[1] == 'json') {
            filename = filename[0];
            runningDatabase = filename;
            load();
            let IDNames = find(query, true, true, withDescription);
            for (let IDName of IDNames) {
                if (!IDName || !IDName[1]) continue;
                IDName = IDName[1];
                res[IDName + '_' + filename] = {
                    name: IDName,
                    description: blocks[IDName].description,
                    collection: filename
                };
            }
        }
    });
    toggleToMain(withDescription?"global-with-descriptions":"global");
    show(Object.keys(res), res);
    if (wasOpened) {
        onGlobalModeClosing = ()=>{
            runningDatabase = wasOpened;
            toggleToMain("standard");
            load();
            showDB();
        };
    } else {
        data = {};
    }
}

//---------------------------------------------------------------------------------------------------------
// Initialization
function init() {
    ipcRenderer.send('started');
    input.addEventListener('keydown', (event)=>{ 
        switch (event.keyCode) {
        case 13: // Responding to enter
            event.preventDefault();
            switch (inputMode) {
                case "standard":
                    if (input.value) process(input.value);
                    else showDB();
                    input.select();
                    break;
                case "global":
                    globalSearch(input.value, false);
                    break;
                case "global-with-descriptions":
                    globalSearch(input.value, true);
                    break;
            }
            
            break;
        case 9: // Responding to tab
            if (inputMode == 'standard'){
                event.preventDefault();
                openEditor();
            }
            break;
        }
    });
    Mousetrap.bind('space', ()=> {
        const flashcard = standardFlashcards.getCurrentFlashcard();
        if (flashcard && flashcard.flashcardNode.className == 'flashcard both')
            flashcard.accessories.mainButtonPressed();
    });
    Mousetrap.bind("space", (e) => { // Responding to space keyup
        const flashcard = standardFlashcards.getCurrentFlashcard();
        if (flashcard) {
            if (flashcard.flashcardNode.className == 'flashcard both') {
                flashcard.accessories.mainButtonClicked();
            }else
                flashcard.rotate();
        } else {
            const introductoryScreen = ExaminationUniversals.getIntroductoryScreen();
            if (introductoryScreen) {
                introductoryScreen.start();
            }
        }
    }, 'keyup');
    Mousetrap.bind("left", (e) => {
        const flashcard = standardFlashcards.getCurrentFlashcard();
        if (flashcard && flashcard.flashcardNode.className == 'flashcard both') {
            flashcard.accessories.press('raw');
        }
    });
    Mousetrap.bind("right", (e) => {
        const flashcard = standardFlashcards.getCurrentFlashcard();
        if (flashcard && flashcard.flashcardNode.className == 'flashcard both') {
            flashcard.accessories.press('finished');
        }
    });
    Mousetrap.bind(["down", "up"], (e) => {
        const flashcard = standardFlashcards.getCurrentFlashcard();
        if (flashcard && flashcard.flashcardNode.className == 'flashcard both') {
            flashcard.accessories.press('inProcess');
        }
    });
    Mousetrap.bind("left", (e) => {
        const flashcard = standardFlashcards.getCurrentFlashcard();
        if (flashcard && flashcard.flashcardNode.className == 'flashcard both') {
            flashcard.accessories.click('raw');
        }
    }, 'keyup');
    Mousetrap.bind("right", (e) => {
        const flashcard = standardFlashcards.getCurrentFlashcard();
        if (flashcard && flashcard.flashcardNode.className == 'flashcard both') {
            flashcard.accessories.click('finished');
        }
    }, 'keyup');
    Mousetrap.bind(["down", "up"], (e) => {
        const flashcard = standardFlashcards.getCurrentFlashcard();
        if (flashcard && flashcard.flashcardNode.className == 'flashcard both') {
            flashcard.accessories.click('inProcess');
        }
    }, 'keyup');

    document.addEventListener('keyup', (ev)=>{
        if (ev.key == 'Escape') {
            if (globals.capturingObjects.length > 0) { 
                globals.capturingObjects[globals.capturingObjects.length-1].close(); // From the last to the first
            } else {
                switch (container.className) {
                    case 'examination':
                        if (examination.getElementsByClassName('flashcard').length > 0) {
                            Examination.toggleToIntroduction();
                        } else Examination.toggleToModeSelection();
                        break;
                    case 'examination-mode-selection':
                        Examination.stop();
                        break;
                    case 'main':
                        toggleToMenu();
                        onGlobalModeClosing && onGlobalModeClosing();
                        onGlobalModeClosing = undefined;
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
    ipcRenderer.on('global-search', globalSearch);
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
    // Examination.createAccessories();
    Examination.init(globals);
    popup.init(globals);
}

window.onload = init; // Starting the program


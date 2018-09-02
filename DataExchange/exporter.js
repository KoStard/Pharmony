/* jshint esversion: 6 */

let docx = require('docx');
let xl = require('excel4node');

const availableFormats = Object.freeze({
    'docx': exportToDocx,
    'xlsx': exportToXLSX
});

module.exports = availableFormats;


function getNotExistingName({name, extension}) {
    let tempName = name,
        index = 1;
    if (extension.length > 0 && extension[0] != '.') extension = '.' + extension;
    while (fs.existsSync(name + extension)) {
        name = tempName + ' - ' + index++;
    }
    return {
        name: name,
        extension: extension
    };
}

let lastCreatedFile;
function exportToDocx({mode, keys, blocks, runningDatabase}) {
    let doc = new docx.Document();
    if (!mode || mode == 'standart') {
        for (let key of keys) {
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
        lastCreatedFile = info.name + info.extension;
    } else if (mode == 'full') {
        let table = doc.createTable(keys.length, 2);
        let rowIndex = 0;
        for (let key of keys) {
            let text = new docx.TextRun(key);
            text.font('Segoe UI');
            table.getCell(rowIndex, 0).addContent(new docx.Paragraph().addRun(text));
            if (blocks[key].description.includes(';')) {
                let lineIndex = 1;
                for (let line of blocks[key].description.split(';')) {
                    line = standardizeText(line);
                    text = new docx.TextRun((line[0] != '#' ? `${lineIndex++}. ` : '') + `${line}`);
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
        lastCreatedFile = info.name + info.extension;
    } else {
        throw `Invalid mode ${mode}.`;
    }
    return lastCreatedFile;
}


function exportToXLSX({mode, keys, blocks, runningDatabase}) {
    let wb = new xl.Workbook();
    let sheet = wb.addWorksheet("Sheet-1");
    let style = wb.createStyle({
        font: {
            name: 'Segoe UI',
        },
    });
    if (!mode || mode == "standard") {
        sheet.cell(1,1).string("Name");
        for (let rowIndex in keys){
            sheet.cell(parseInt(rowIndex) + 1, 1).string(keys[rowIndex]).style(style);
        }
    } else if (mode == 'full') {
        sheet.cell(1, 1).string("Name");
        sheet.cell(1, 2).string("Description");
        for (let rowIndex in keys) {
            sheet.cell(parseInt(rowIndex) + 2, 1).string(keys[rowIndex]).style(style);
            let index = 0;
            for (let descr of blocks[keys[rowIndex]].description.split(';')){
                sheet.cell(parseInt(rowIndex) + 2, index + 2).string(descr).style(style);
                index += 1;
            }
        }
    }
    let info = getNotExistingName({
                name: runningDatabase,
                extension: '.xlsx'
            });
    wb.write(info.name + '.xlsx', (err)=>{console.log(err);});
    lastCreatedFile = info.name + info.extension;
    return lastCreatedFile;
}
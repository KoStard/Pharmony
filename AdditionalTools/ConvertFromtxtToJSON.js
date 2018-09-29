/* jshint esversion: 6 */

const fs = require('fs');

const dbFolder = './../Databases/';

fs.readdirSync(dbFolder).forEach((filename) => {
    if (filename.slice(filename.length - 4) == '.txt') {
        let blocks = {};
        let content = fs.readFileSync(dbFolder + filename).toString().split("\n");
        for (let line of content) {
            if (line) {
                let block = JSON.parse(line);
                // console.log(block.name);
                blocks[block.name] = {
                    description: block.description,
                    individual: {
                        standardFlashcards: {
                            lastSequence: [],
                            last: ''
                        },
                    }
                };
            }
        }
        let data = {
            blocks: blocks,
            global: {
                standardFlashcards: {},
            }
        };
        fs.writeFileSync(dbFolder + filename.slice(0, filename.length - 4) + '.json', JSON.stringify(data));
    }
});

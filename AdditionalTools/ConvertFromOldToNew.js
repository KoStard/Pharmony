const fs = require('fs');
function createNormalBlocksAndCreateData() {
    process.argv.slice(2).forEach((arg) => {
        if (arg.length <= 4 || arg.slice(arg.length - 4, arg.length) != '.json') arg += '.json';
        let data = JSON.parse(fs.readFileSync("./../Databases/" + arg));
        if (!data.blocks) {
            let content = data.slice();
            let blocks = {};
            for (let index in content) {
                blocks[content[index].name] = {
                    description: content[index].description,
                    individual: {
                        standardFlashcards: {
                            lastSequence: [],
                            last: ''
                        },
                    }
                };
            }
            data = {
                blocks: blocks,
                global: {
                    standardFlashcards: {},
                }
            };
        }
        fs.writeFileSync("./../Databases/" + arg, JSON.stringify(data));
    });
}

createNormalBlocksAndCreateData();
/* jshint esversion: 6 */
const { escapeRegExp } = require('./universals');

class Finder {
    constructor(data_getter) {
        this.data_getter = data_getter;
        this.last = null;
    }
    find({
        query,
        case_insensitive,
        private_search,
        indexed=true,
        include_description,
    }) {
        if (!query) return;
        this.blocks = this.data_getter().blocks;
        if (!private_search) this.last = query;
        this.processor = this.get_processor(query, case_insensitive);
        let res = indexed?{}:[];
        if (include_description) {
            let index = 1;
            for (let [name, indiv] of Object.entries(this.blocks)) {
                if (this.check_block(name, indiv.description)) if (indexed) res[index++] = name; else res.push(name);
            }
        } else {
            let index = 1;
            for (let name of Object.keys(this.blocks)) {
                if (this.check_block(name)) if (indexed) res[index++] = name; else res.push(name);
            }
        }
        delete this.blocks;
        return res;
    }
    check_block(name, description) {
        return this.processor(name) || (description && this.processor(description));
    }
    get_processor(query, case_insensitive) {
        if (query[0] == '*') {
            query = query.slice(1);
            let processor = this.process_query_as_regexp(query, case_insensitive);
            return (text) => !!processor.exec(text);
        } else {
            let processed_query = this.process_query_as_default(query, case_insensitive);
            return (text) => {
                console.log("Running processor");
                let queries = {};
                if (case_insensitive) text = text.toLowerCase();
                for (let sep_data of processed_query) {
                    for (let q of Object.keys(sep_data)) {
                        console.log("Adding to queries", q);
                        queries[q] = 0;
                    }
                }
                for (let c of text) {
                    let to_remove = [];
                    for (let sep_query of Object.keys(queries)) {
                        if (sep_query[queries[sep_query]] == c) {
                            queries[sep_query] += 1;
                            if (queries[sep_query] == sep_query.length) {
                                to_remove.push(sep_query);
                            }
                        } else {
                            queries[sep_query] = 0;
                        }
                    }
                    for (let tr of to_remove) {
                        delete queries[tr];
                    }
                }
                let valid = false;
                for (let sep_data of processed_query) {
                    let local_valid = true;
                    for (let q of Object.keys(sep_data)) {
                        if (sep_data[q] == '+') {
                            if (q in queries) {
                                local_valid = false;
                                break;
                            }
                        } else {
                            if (!(q in queries)) {
                                local_valid = false;
                                break;
                            }
                        }
                    }
                    if (local_valid) {
                        valid = true;
                        break;
                    }
                }
                return valid;
            };
        }
    }
    process_query_as_regexp(query, case_insensitive) {
        return RegExp(query, 'g'+(case_insensitive?'i':''));
    }
    process_query_as_default(query, case_insensitive) {
        if (case_insensitive) query = query.toLowerCase();
        let res = [];
        for (let sep of query.split('|')) {
            let sep_data = {};
            sep = sep.match(/(?:^|[&^!])[^!&^]+/g);
            for (let bl of sep) {
                switch (bl[0]) {
                    case '!': case '^':
                        sep_data[bl.slice(1)] = '-';
                        break;
                    case '&':
                        sep_data[bl.slice(1)] = '+';
                        break;
                    default:
                        sep_data[bl] = '+';
                        break;
                }
            }
            res.push(sep_data);
        }
        return res;
    }
};

module.exports = Finder;
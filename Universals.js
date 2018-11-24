/* jshint esversion: 6 */
module.exports = {
    escapeRegExp: function(string) {
        return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'); // $& means the whole matched string
    }
}
var fs = require('fs');

var QUOTION_MARK = '"';
var ARRAY_SYMBOL = '[]';

var PATT_COMMENT_LINE = /^;.*$/gi;
var PATT_TITLE_LINE = /^\[([a-zA-Z0-9_\-]+)\s*(:\s*([a-zA-Z0-9_\-]+))?\s*\]$/;
var PATT_DATA_LINE = /^([a-zA-Z0-9\._\-]+)(\[\])?\s*=\s*(.*)$/;
var PATT_SLASH = /(\\+)$/;

// utility
/**
 * Very lazy solution to copy object :)
 * 
 * @param object obj
 *
 * @return object
 */
function clone(obj) {
    return JSON.parse(JSON.stringify(obj));
};

/**
 * Strip slashes
 *
 * @param string strData
 * 
 * @return string
 */
function stripslashes(strData) {
    return strData
            .replace(/\\'/g, '\'')
            .replace(/\\"/g, '"')
            .replace(/\\0/g, '\0')
            .replace(/\\\\/g, '\\');
};

/**
 * Add slashes
 * 
 * @param string strData
 * 
 * @return string
 */
function addslashes(strData) {
    if (typeof(strData) != 'string') {
        strData = '' + strData;
    }
    return strData
            .replace(/\\/g, '\\\\')
            //.replace(/\'/g, '\\\'')
            .replace(/\"/g, '\\"')
            .replace(/\0/g, '\\0');
};
// end utility

// matches line
/**
 * Title line like [Title] or [Title:Parent]
 */
function isTitle(line) {
    return line.match(PATT_TITLE_LINE);
};

/**
 * Coment line like ; some coment
 */
function isComent(line) {
    return line.match(PATT_COMMENT_LINE);
};

/**
 * Standard line like "foo.bar2 = 2"
 */
function isData(line) {
    return line.match(PATT_DATA_LINE);
};
// end matches line

/**
 * Change object to ini string
 * @param <Object> obj
 */
function objToIni(chunk, firstElementIsTitle, prefix) {
    if (!prefix) {
        var prefix = '';
    }
    var result = '';
    if (Array.isArray(chunk)) {
        for (var i = 0; i < chunk.length; i++) {
            result += prefix + '[] = "' + addslashes(chunk[i]) + '"\n';
        }
    } else if (typeof(chunk) == 'object') {
        if (firstElementIsTitle) {
            for (var unit in chunk) {
                result += '[' + unit + ']\n';
                result += objToIni(chunk[unit]);
            }
        } else {
            for (var unit in chunk) {
                result += objToIni(chunk[unit], false, prefix ? prefix + '.' + unit : unit);
            }
        }
    } else {
        return prefix + ' = "' + addslashes(chunk) + '"\n';
    }
    return result;
};

/**
 * Change string from ini file to javascript object
 *
 * @param string str
 *
 * @return object
 */
function iniToObj(str) {
    var result = {};
    var resultPoint = result;
    var lines = str.split('\n');
    for (var i=0; i < lines.length; i++) {
        var line = lines[i].replace(/(\r$|^\s*|\s*$)/gi, '');
        var localResultPoint = resultPoint;
        
        // coment line like ; some coment
        if (line == '' || isComent(line)) {
            continue;
        }
        var matches = [];
        
        // title line like [Title] or [Title:Parent]
        if (matches = isTitle(line)) {
            if (typeof(matches[3]) == typeof('')) {
                result[matches[1]] = clone(result[matches[3]]);
            } else {
                result[matches[1]] = {};
            }
            resultPoint = result[matches[1]];
            continue;
        }
        
        // standard line like "foo.bar2 = 2"
        if (matches = isData(line)) {
            var levels = matches[1].split('.');
            for (var lv = 0; lv < levels.length; lv++) {
                if (localResultPoint === null || typeof(resultPoint) != 'object') {
                    if (lv+1 == levels.length && matches[2] == ARRAY_SYMBOL) {
                        localResultPoint = [];
                    } else {
                        localResultPoint = {};
                    }
                }
                if (typeof(localResultPoint[levels[lv]]) == 'undefined') {
                    if (lv + 1 == levels.length && matches[2] == ARRAY_SYMBOL) {
                        localResultPoint[levels[lv]] = [];
                    } else {
                        localResultPoint[levels[lv]] = {};
                    }
                }
                // parse value
                if (lv+1 < levels.length) {
                    localResultPoint = localResultPoint[levels[lv]];
                }
            }
            lv--;
            // wyciąganie danych z danych
            var value = matches[3];
            if (value[0] == QUOTION_MARK) {
                endIndex = 1;
                do {
                    endIndex = value.indexOf(QUOTION_MARK, endIndex + 1);
                } while (
                    (value.substring(1, endIndex)).match(PATT_SLASH) &&
                    (value.substring(1, endIndex)).match(PATT_SLASH)[1].length % 2 != 0 && 
                    endIndex !== false
                );
                if (endIndex === false) {
                    throw new MultilevelIniException('Can\'t find end quote');
                    return;
                }
                
                value = value.substring(1, endIndex);
            } else {
                value = value.replace(/( *| *;.*)$/, '');
            }
            value = stripslashes(value);
            // przypisanie
            if (matches[2] == ARRAY_SYMBOL) {
                if (typeof(localResultPoint[levels[lv]]) == 'undefined') {
                    localResultPoint[levels[lv]] = [];
                }
                localResultPoint[levels[lv]].push(value);
            } else {
                localResultPoint[levels[lv]] = value;
            }
            continue;
        }
    }
    return result;
};

/**
 * Read and convert to javascript object 
 * 
 * @param string   filePath
 * @param function callback
 */
function get(filePath, callback) {
	fs.readFile(filePath, 'utf-8', function(error, data) {
        if (error) {
            callback(error);
            return;
        }
        try {
             var data = iniToObj(data);
        } catch (e) {
            callback(e);
            return;
        }
        callback(null, data);
	});
};

/**
 * Save object to file in ini format
 *
 * @param object data
 * @param string filePath
 */
function set(data, filePath, callback) {
    fs.writeFile(filePath, objToIni(data, true), callback); 
};

/**
 * Simple exception object
 *
 * @param code
 * @param msg
 */
function MultilevelIniException(msg, code) {
    this.message = msg;
    this.code = code;
};

/**
 * toString()
 */
MultilevelIniException.prototype.toString = function() {
    return this.code + ': ' + this.message; 
};


module.exports.get = get;
module.exports.set = set;
module.exports.objToIni = objToIni;
module.exports.iniToObj = iniToObj;

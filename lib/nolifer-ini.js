var fs = require('fs');

var quotionMark = '"';
var ARRAY_SYMBOL = '[]';

var pattComentLine = /^;.*$/gi;
var pattTitleLine = /^\[([a-zA-Z0-9_\-]+)\s*(:\s*([a-zA-Z0-9_\-]+))?\s*\]$/;
var pattDataLine = /^([a-zA-Z0-9\._\-]+)(\[\])?\s*=\s*(.*)$/;
var pattSlash = /(\\+)$/;
var pattTitleLine2 = /^$/;

var exceptions = {
    BAD_END_QUOTE: 1
};

function Simple() {
}

/**
 * Very lazy solution to copy object :)
 * @param <Object> obj
 */
function clone(obj) {
    return JSON.parse(JSON.stringify(obj));
};


/**
 * Read and convert to javascript object 
 */
function get(filePath, callback) {
	fs.readFile(filePath, 'utf-8', function(error, data) {
        if (error) {
            callback(error);
            return;
        }
        try {
            var result = iniToObj(data)
            callback(null, result);
        } catch (e) {
            callback(e);
        }
	});
};

/**
 * Save object to file in ini format
 */
function set(data, filePath) {
    
};

/**
 * Change object to ini string
 * @param <Object> obj
 */
function objToIni(obj) {
    
};

/**
 * Change string from ini file to javascript object
 * @param <String> str
 */
function iniToObj(str) {
    var result = {};
    var resultPoint = result;
    var lines = str.split('\n');
    for (var i=0; i < lines.length; i++) {
        var line = lines[i].replace(/(\r$|^\s*|\s*$)/gi, '');
        var localResultPoint = resultPoint;
        
        // coment line like ; some coment
        if (line == '' || line.match(pattComentLine)) {
            continue;
        }
        var matches = [];
        
        // title line like [Title] or [Title:Parent]
        if (matches = line.match(pattTitleLine)) {
            if (typeof(matches[3]) == typeof('')) {
                result[matches[1]] = clone(result[matches[3]]);
            } else {
                result[matches[1]] = {};
            }
            resultPoint = result[matches[1]];
            continue;
        }
        
        // standard line like "foo.bar2 = 2"
        if (matches = line.match(pattDataLine)) {
            var levels = matches[1].split('.');
            for (var lv = 0; lv < levels.length; lv++) {
                if (localResultPoint === null || typeof(resultPoint) != 'object') {
                    if (lv+1 == levels.length && matches[2] == ARRAY_SYMBOL) {
                        localResultPoint = [];
                    } else {
                        localResultPoint = new Simple();
                    }
                }
                if (typeof(localResultPoint[levels[lv]]) == 'undefined') {
                    if (lv+1 == levels.length && matches[2] == ARRAY_SYMBOL) {
                        localResultPoint[levels[lv]] = [];
                    } else {
                        localResultPoint[levels[lv]] = new Simple();
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
            if (value[0] == quotionMark) {
                endIndex = 1;
                do {
                    endIndex = value.indexOf(quotionMark, endIndex+1);
                } while (
                    (value.substring(1, endIndex)).match(pattSlash) &&
                    (value.substring(1, endIndex)).match(pattSlash)[1].length % 2 != 0 && 
                    endIndex !== false
                );
                if (endIndex === false) {
                    throw new NoliferIniException(exceptions.BAD_END_QUOTE, 'Can\'t find end quote');
                    return;
                }
                
                value = value.substring(1, endIndex);
            } else {
                value = value.replace(/(;.*)$/, '');
            }
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
 * Simple exception object
 * @param code
 * @param msg
 */
function NoliferIniException(code, msg) {
    this.code = code;
    this.message = msg;
};

NoliferIniException.prototype.toString = function() {
    return this.code + ': ' + this.message; 
};

module.exports.get = get;
module.exports.set = set;
module.exports.objToIni = objToIni;
module.exports.iniToObj = iniToObj;

var ini = require('../lib/multilevel-ini.js');

/**
 * Only for test
 */
function assert(patern, value, line) {
    if (patern !== value) {
        console.log('[Fail] Excepted in ' + (''+line) + ': (' + 
            (''+typeof(patern)) + ')"' + (''+patern) + '"' + 
            ' given (' + (''+typeof(value)) + ')"' + (''+value) + '"\n');
        return false;
    } else {
        console.log('[Ok]   ' + (''+line) + ' = ' + value);
        return true;
    }
};

ini.get('test.ini', function(error, ini) {
        console.log('ini to obj:');
        if (error) {
            console.log('error', error);
        }
        if (ini) {
            assert('1', ini['First']['foo']['bar'], '[First] foo.bar');
            assert('2', ini['First']['foo']['bar2'], '[First] foo.bar2');
            assert('any text', ini['First']['foo']['bar3'], '[First] foo.bar3');
            assert('5', ini['First']['foo']['foo'][0], '[First] foo.foo.0');
            assert('ścinam ąźó', ini['First']['foo']['foo'][1], '[First] foo.foo.1');
            assert('2.3123', ini['First']['foo']['foo'][2], '[First] foo.foo.2');
            assert('other text', ini['First']['foo']['foo'][3], '[First] foo.foo.3');
            assert('text" and other ; text', ini['First']['bar'], '[First] bar');
            assert('text\\\\" and other ; text', ini['First']['far'], '[First] far');
            
            assert('1', ini['Second']['foo']['bar'], '[Second] foo.bar');
            assert('', ini['Second']['foo']['bar2'], '[Second] foo.bar2');
            assert('any text', ini['Second']['foo']['bar3'], '[Second] foo.bar3');
            assert('5', ini['Second']['foo']['foo'][0], '[Second] foo.foo.0');
            assert('ścinam ąźó', ini['Second']['foo']['foo'][1], '[Second] foo.foo.1');
            assert('2.3123', ini['Second']['foo']['foo'][2], '[Second] foo.foo.2');
            assert('new text', ini['Second']['foo']['foo'][3], '[Second] foo.foo.3');
            assert('text" and other ; text', ini['Second']['bar'], '[Second] bar');
            assert('True', ini['Second']['very']['long']['ini']['element']['and']['simple']['data'], '[Second] very.long.ini.element.and.simple.data');
        }
});

var exObj = {
      'First': {
          'foo': {
              'bar': 'example string',
              'foo': 1024,
              'far': {
                  'foo': [1,2,3,4,5,7,8,9]
              }
          },
          'bar': 'Foo \' other ; \\\\\"'
      },
      'Second : First': {
          'foo': {
              'one': ['1', 2, '\"', "'"]
          },
          'bar': '/foo/bar/foo/bar',
          'far': 'z:\some\windows\path',
          'bor': {
              1: '11',
              2: '22',
              3: '33'
          }
      }
};

console.log('obj to ini:');
console.log(ini.objToIni(exObj, true));
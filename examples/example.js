var ini = require('../lib/nolifer-ini.js');

ini.get('test.ini', function(error, b) {
        console.log('My ini file in js:', error, b);
        if (b) {
            console.log('b.First.foo.foo     ', b.First.foo.foo);
            console.log('b.First.foo.foo[3]  ', b.First.foo.foo[3]);
            console.log('b.Second.foo.foo    ', b.Second.foo.foo);
            console.log('b.Second.foo.foo[3] ', b.Second.foo.foo[3]);
        }
});
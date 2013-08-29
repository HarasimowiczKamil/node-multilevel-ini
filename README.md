# README #

[![NPM](https://nodei.co/npm/multilevel-ini.png?downloads=true&stars=true)](https://nodei.co/npm/multilevel-ini/)

## Installation ##

```
npm install multilevel-ini
```
or in package.json
```
...
"dependencies": {
    "multilevel-ini": "*",
}
...
```

## Usage ##

```js
var ini = require('multilevel-ini');

ini.get('some.ini', function(error, result) {
    if (!error) {
        console.log('result', result);
    }
});

var obj = {
    'FirstZone': {
        'foo': 'any value',
        'bar': {
            'foo': [1,2,3,4,5]
        }
    },
    'SecondZone': {
        'foo': [
            'foo',
            'bar',
            'foo',
            'bar'
        ]
    }
};

ini.set(obj, 'some.ini', function(error, result) {
    if (error) {
        console.log(error);
        return;
    }
    console.log('save ok');
});
```

more in examples

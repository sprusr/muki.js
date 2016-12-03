# muki.js

Muki.js is a JavaScript module for sending data to the [Paulig Muki](http://pauligmuki.com/). The API for the Muki is pretty locked down, libraries are provided only for Android and iOS, and source files are not available. This project aims to open up the Muki a bit more, and give way for some new and interesting projects!

# Getting started

```shell
npm install --save muki
```

```JavaScript
var muki = require('muki')

muki.getDeviceName('0001234', function(err, deviceId) {
  muki.convertImage('./image.png', function(err, buffer) {
    muki.sendBuffer(deviceId, buffer, function(err) {
      console.log('Finished sending data!')
    })
  })
})
```

For more info about the protocol, see [akx/Paulig-Muki](https://github.com/akx/Paulig-Muki/blob/master/API.md).

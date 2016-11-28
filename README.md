# muki.js

Muki.js is a JavaScript module for sending data to the [Paulig Muki](http://pauligmuki.com/). The API for the Muki is pretty locked down, libraries are provided only for Android and iOS, and source files are not available. This project aims to open up the Muki a bit more, and give way for some new and interesting projects!

# Getting started

```shell
npm install --save muki
```

```JavaScript
var muki = require('muki')

var imageData = new Buffer('ff'.repeat(46464), 'hex')

muki.getDeviceName('0001234', function(deviceId) {
  muki.sendBuffer(deviceId, imageData, function() {
    console.log('Finished sending data!')
  })
})
```

The image data must be a buffer of pixels from an 8bit monochrome bitmap, of which the dimenstions are 176 x 264 pixels. There are plans for functions for reading images from various formats from the filesystem and converting them to this format, but for the time being this must be handled externally.

For more info about the protocol, see [akx/Paulig-Muki](https://github.com/akx/Paulig-Muki/blob/master/API.md).

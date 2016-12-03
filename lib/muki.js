var noble = require('noble')
var request = require('request')
var Jimp = require("jimp")
var floydSteinberg = require('floyd-steinberg')
var PNG = require('pngjs').PNG

var SERVICE_UUIDS = ['6E400001-B5A3-F393-E0A9-E50E24DCCA9E', '06640001-9087-04A8-658F-CE44CB96B4A1']
var CHARACTERISTIC_UUIDS = ['6E400002-B5A3-F393-E0A9-E50E24DCCA9E', '06640002-9087-04A8-658F-CE44CB96B4A1']

var getDeviceName = function (id, cb) {
  request('https://back.pauligmuki.fi/smartcc/rest/V1/number/long/' + id, function (err, res, body) {
    if (!err && res.statusCode == 200) {
      cb(null, JSON.parse(body).result.number)
    } else {
      cb(err)
    }
  })
}

var sendBuffer = function (device, buffer, cb) {
  onReady(function () {
    noble.startScanning()
  })

  noble.on('discover', function (peripheral) {
    if (peripheral.advertisement.localName && peripheral.advertisement.localName == device) {
      noble.stopScanning()
      peripheral.connect(function (err) {
        if (err) {
          cb(err)
        } else {
          peripheral.discoverAllServicesAndCharacteristics(function (err, services, characteristics) {
            if (err) {
              cb(err)
            } else {
              writeChunks(characteristics[1], buffer, function (err) {
                cb(err)
              })
            }
          })
        }
      })
    }
  })
}

var convertImage = function (imagePath, cb) {
  Jimp.read(imagePath, function (err, image) {
    if (err) cb(err)
    image.resize(176, 264).rotate(90)
    image.getBuffer(Jimp.MIME_PNG, function (err, buffer) {
      if (err) cb(err)
      new PNG({ filterType: 4 }).parse(buffer, function (err, data) {
        if (err) cb(err)
        var ditherImage = floydSteinberg({
          data: data.data,
          length: data.data.length,
          width: image.bitmap.width
        })

        var newBuf = Buffer.alloc(5820)

        for (var i = 0; i < 46464; i += 8) {
          var intToAdd = 0
          for (var j = 0; j < 8; j++) {
            if (ditherImage.data[(i + j) * 4] == 0) {
              intToAdd += 128/Math.pow(2, 7 - j)
            }
          }
          newBuf.writeUInt8(intToAdd, i/8)
        }

        cb(null, newBuf)
      })
    })
  })
}

var writeChunks = function (characteristic, buffer, cb) {
  characteristic.write(new Buffer('t'), true, function (err) {
    if (err) cb(err)
  })
  for (var i = 0; i < 291; i++) {
    characteristic.write(buffer.slice(i * 20, i * 20 + 20), true, function (err) {
      if (err) cb(err)
    })
  }
  characteristic.write(new Buffer('d'), true, function (err) {
    cb(err)
  })
}

var onReady = function (cb) {
  if (noble.state == 'poweredOn') {
    cb()
  } else {
    noble.on('stateChange', function (state) {
      if (state == 'poweredOn') {
        cb()
      }
    })
  }
}

module.exports = {
  getDeviceName: getDeviceName,
  sendBuffer: sendBuffer,
  convertImage: convertImage
}

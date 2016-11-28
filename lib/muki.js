var noble = require('noble')
var request = require('request')

var SERVICE_UUIDS = ['6E400001-B5A3-F393-E0A9-E50E24DCCA9E', '06640001-9087-04A8-658F-CE44CB96B4A1']
var CHARACTERISTIC_UUIDS = ['6E400002-B5A3-F393-E0A9-E50E24DCCA9E', '06640002-9087-04A8-658F-CE44CB96B4A1']

var getDeviceName = function(id, cb) {
  request('https://back.pauligmuki.fi/smartcc/rest/V1/number/long/' + id, function (error, response, body) {
    if (!error && response.statusCode == 200) {
      cb(JSON.parse(body).result.number)
    }
  })
}

var sendBuffer = function(device, buffer, cb) {
  onReady(function() {
    noble.startScanning(SERVICE_UUIDS, true)
  })

  noble.on('discover', function(peripheral) {
    if(peripheral.advertisement.localName && peripheral.advertisement.localName.startsWith(device)) {
      peripheral.connect(function(err) {
        peripheral.discoverAllServicesAndCharacteristics(function(err, services, characteristics) {
          for (var i = 0; i < characteristics; i++) {
            if(CHARACTERISTIC_UUIDS.indexOf(characteristics[i].uuid)) {
              characteristics[1].write(new Buffer('74', 'hex'), true, function(err) {
                writeChunk(characteristics[1], writeChunk, buffer, null, cb)
              })
            }
          }
        })
      })
    }
  })
}

var writeChunk = function(char, cb, buf, packs, finalCb) {
  if(!packs) {
    packs = 0
  }

  if(packs < 291) {
    char.write(buf.slice(packs * 20, packs * 20 + 20), true, function(err) {
      cb(char, cb, buf, packs++)
    })
  } else {
    char.write(new Buffer('64', 'hex'), true, function(err) {
      finalCb()
    })
  }
}

var onReady = function(cb) {
  noble.on('stateChange', function(state) {
    if(state == 'poweredOn') {
      cb()
    }
  })
}

module.exports = {
  getDeviceName: getDeviceName,
  sendBuffer: sendBuffer
}

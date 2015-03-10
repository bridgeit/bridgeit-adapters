var should = require('should');
var assert = require('assert');
var util = require('util');
var log = util.debuglog('test');
var ba = require('../../index.js');

describe('basicwebsocket', function () {

    var remoteWSSettings = {
        location: 'core',
        name: 'basicwebsocket',
        config: {
            host: 'echo.websocket.org',
            path: '/'
        },
        body: {
            message: 'Test Message'
        }
    };

    it('get an adapter instance then execute', function (done) {

        ba.getAdapterInstance(remoteWSSettings, function (err, adapterInstance) {

            assert.ifError(err);
            assert(adapterInstance);

            adapterInstance.execute(remoteWSSettings, function (err, adapterResult) {

                assert.ifError(err);
                assert('result', adapterResult);
                log(adapterResult);
                done();

            });
        });
    });

    it('get and execute adapter in one call', function (done) {

        ba.executeAdapter(remoteWSSettings, function (err, adapterResult) {

            assert.ifError(err);
            assert(adapterResult);
            log('result', adapterResult);
            assert(adapterResult === remoteWSSettings.body.message);
            done();

        });
    });

});

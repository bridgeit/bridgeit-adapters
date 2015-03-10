var should = require('should');
var assert = require('assert');
var util = require('util');
var log = util.debuglog('test');
var ba = require('../../index.js');

describe('basichttp', function () {

    var remoteJSONSettings = {
        location: 'core',
        name: 'basichttp',
        config: {
            host: 'jsonplaceholder.typicode.com',
            path: '/posts/1'
        }
    };

    it('get an adapter instance then execute', function (done) {

        ba.getAdapterInstance(remoteJSONSettings, function (err, adapterInstance) {

            assert.ifError(err);
            assert(adapterInstance);

            adapterInstance.execute(remoteJSONSettings, function (err, adapterResult) {

                assert.ifError(err);
                assert(adapterResult);
                assert(adapterResult.id);
                assert.equal(adapterResult.id, 1);
                done();

            });
        });
    });

    it('get and execute adapter in one call', function (done) {

        ba.executeAdapter(remoteJSONSettings, function (err, adapterResult) {

            assert.ifError(err);
            assert(adapterResult);
            assert(adapterResult.id);
            assert.equal(adapterResult.id, 1);
            done();

        });
    });

});

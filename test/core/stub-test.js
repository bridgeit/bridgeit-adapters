var should = require('should');
var assert = require('assert');
var util = require('util');
var log = util.debuglog('test');
var ba = require('../../index.js');

describe('stub', function () {

    var stubSettings = {
        location: 'core',
        name: 'stub',
        config: {
            other: 'overridden other'
        }
    };

    it('get an adapter instance then execute', function (done) {

        ba.getAdapterInstance(stubSettings, function (err, adapterInstance) {

            assert.ifError(err);
            assert(adapterInstance);

            adapterInstance.execute(stubSettings, function (err, adapterResult) {

                assert.ifError(err);
                assert.strictEqual(adapterResult.other, stubSettings.config.other);
                done();

            });
        });
    });

    it('get and execute adapter in one call', function (done) {

        ba.executeAdapter(stubSettings, function (err, adapterResult) {

            assert.ifError(err);
            assert.strictEqual(adapterResult.other, stubSettings.config.other);
            done();

        });
    });

});

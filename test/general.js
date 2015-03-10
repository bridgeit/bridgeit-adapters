var should = require('should');
var assert = require('assert');
var util = require('util');
var ba = require('../index.js');

describe('params', function () {

    it('null params, throws error', function (done) {

        ba.getAdapterInstance(null, function (err, adapterInstance) {

            assert(err);
            done();

        });
    });

    it('empty params, throws error', function (done) {

        ba.getAdapterInstance({}, function (err, adapterInstance) {

            assert(err);
            done();

        });
    });

    it('partial params, throws error', function (done) {

        ba.getAdapterInstance({name: 'basichttp'}, function (err, adapterInstance) {

            assert(err);
            done();

        });
    });

});

var should = require('should');
var assert = require('assert');
var util = require('util');
var log = util.debuglog('test');
var ba = require('../../index.js');

describe('basicbridgeit', function () {

    var testHost = 'dev.bridgeit.io';
    var testAccount = 'bridgeit_demo';
    var testRealm = 'context.chat';
    var testUser = 'bccu1';
    var testPassword = 'password';

    before(function (done) {

        var getTokenSettings = {
            location: 'core',
            name: 'basicbridgeit',
            config: {
                host: testHost,
                service: 'auth',
                account: testAccount,
                realm: testRealm,
                path: 'token',
                params: {
                    username: testUser,
                    password: testPassword
                },
                body: {}
            }
        };

        ba.executeAdapter(getTokenSettings, function (err, adapterResult) {

            assert.ifError(err);
            assert(adapterResult);
            assert(adapterResult.access_token);
            accessToken = adapterResult.access_token;
            log('access_token', accessToken);
            done();
        });
    });

    describe('invalid token', function () {

        var basicBridgeItInvalidTokenSettings = {
            location: 'core',
            name: 'basicbridgeit',
            config: {
                host: testHost,
                service: 'locate',
                account: testAccount,
                realm: testRealm,
                path: 'regions',
                params: {
                    access_token: 'invalidTokenHere'
                },
                body: {}
            }
        };

        it('get an adapter instance then execute (invalid token fails)', function (done) {

            ba.getAdapterInstance(basicBridgeItInvalidTokenSettings, function (err, adapterInstance) {

                assert.ifError(err);
                assert(adapterInstance);

                adapterInstance.execute(basicBridgeItInvalidTokenSettings, function (err, adapterResult) {

                    assert.ifError(err);
                    assert(adapterResult);
                    assert(adapterResult.status);
                    assert.equal(adapterResult.status, 400);
                    done();

                });
            });
        });

        it('get and execute adapter in one call (invalid token fails)', function (done) {

            ba.executeAdapter(basicBridgeItInvalidTokenSettings, function (err, adapterResult) {

                assert.ifError(err);
                assert(adapterResult);
                assert(adapterResult.status);
                assert.equal(adapterResult.status, 400);
                done();

            });
        });

    });

    describe('valid token', function () {

        var basicBridgeItValidTokenSettings = {
            location: 'core',
            name: 'basicbridgeit',
            config: {
                host: testHost,
                service: 'docs',
                account: testAccount,
                realm: testRealm,
                path: 'documents',
                params: {},
                body: {}
            }
        };

        it('get an adapter instance then execute', function (done) {

            basicBridgeItValidTokenSettings.config.params.access_token = accessToken;

            ba.getAdapterInstance(basicBridgeItValidTokenSettings, function (err, adapterInstance) {

                assert.ifError(err);
                assert(adapterInstance);

                adapterInstance.execute(basicBridgeItValidTokenSettings, function (err, adapterResult) {

                    assert.ifError(err);
                    assert(adapterResult);
                    done();

                });
            });
        });

        it('get and execute adapter in one call', function (done) {

            ba.executeAdapter(basicBridgeItValidTokenSettings, function (err, adapterResult) {

                assert.ifError(err);
                assert(adapterResult);
                done();

            });
        });

    });

});

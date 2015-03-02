/*
 * ICESOFT COMMERCIAL SOURCE CODE LICENSE V 1.1
 *
 * The contents of this file are subject to the ICEsoft Commercial Source
 * Code License Agreement V1.1 (the "License"); you may not use this file
 * except in compliance with the License. You may obtain a copy of the
 * License at
 * http://www.icesoft.com/license/commercial-source-v1.1.html
 *
 * Software distributed under the License is distributed on an "AS IS"
 * basis, WITHOUT WARRANTY OF ANY KIND, either express or implied. See the
 * License for the specific language governing rights and limitations under
 * the License.
 *
 * Copyright 2009-2014 ICEsoft Technologies Canada, Corp. All Rights Reserved.
 */

var should = require('should');
var assert = require('assert');
var util = require('util');
var ba = require('../index.js');

var accessToken = null;

describe('BridgeIt Adapters', function () {

    var testHost = 'dev.bridgeit.io';
//    var testHost = '54.201.2.84';
    var testAccount = 'bridgeit_demo';
    var testRealm = 'context.chat';
    var testUser = 'bccu1';
    var testPassword = 'password';

    before(function (done) {

        var adapterInfo = {
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

        ba.executeAdapter(adapterInfo, function (err, adapterResult) {

            assert.ifError(err);
            assert(adapterResult);
            assert(adapterResult.access_token);
            accessToken = adapterResult.access_token;
            //console.log('access_token', accessToken);
            done();
        });
    });

    describe('Parameters', function () {

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

    describe('StubAdapter', function () {

        var adapterInfo = {
            location: 'core',
            name: 'stub',
            config: {
                other: 'overridden other'
            }
        };

        it('get an adapter instance then execute', function (done) {

            ba.getAdapterInstance(adapterInfo, function (err, adapterInstance) {

                assert.ifError(err);
                assert(adapterInstance);

                adapterInstance.execute(adapterInfo.config, function (err, adapterResult) {

                    assert.ifError(err);
                    assert.strictEqual(adapterResult.other, adapterInfo.config.other);
                    done();

                });
            });
        });

        it('get and execute adapter in one call', function (done) {

            ba.executeAdapter(adapterInfo, function (err, adapterResult) {

                assert.ifError(err);
                assert.strictEqual(adapterResult.other, adapterInfo.config.other);
                done();

            });
        });

    });

    describe('BasicAdapter', function () {

        var adapterInfo = {
            location: 'core',
            name: 'basichttp',
            config: {
                host: 'jsonplaceholder.typicode.com',
                path: '/posts/1'
            }
        };

        it('get an adapter instance then execute', function (done) {

            ba.getAdapterInstance(adapterInfo, function (err, adapterInstance) {

                assert.ifError(err);
                assert(adapterInstance);

                adapterInstance.execute(adapterInfo.config, function (err, adapterResult) {

                    assert.ifError(err);
                    assert(adapterResult);
                    assert(adapterResult.id);
                    assert.equal(adapterResult.id, 1);
                    done();

                });
            });
        });

        it('get and execute adapter in one call', function (done) {

            ba.executeAdapter(adapterInfo, function (err, adapterResult) {

                assert.ifError(err);
                assert(adapterResult);
                assert(adapterResult.id);
                assert.equal(adapterResult.id, 1);
                done();

            });
        });

    });

    describe('BasicBridgeItAdapter - invalid token', function () {

        var adapterInfo = {
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

            ba.getAdapterInstance(adapterInfo, function (err, adapterInstance) {

                assert.ifError(err);
                assert(adapterInstance);

                adapterInstance.execute(adapterInfo.config, function (err, adapterResult) {

                    assert.ifError(err);
                    assert(adapterResult);
                    assert(adapterResult.status);
                    assert.equal(adapterResult.status, 400);
                    done();

                });
            });
        });

        it('get and execute adapter in one call (invalid token fails)', function (done) {

            ba.executeAdapter(adapterInfo, function (err, adapterResult) {

                assert.ifError(err);
                assert(adapterResult);
                assert(adapterResult.status);
                assert.equal(adapterResult.status, 400);
                done();

            });
        });

    });

    describe('BasicBridgeItAdapter - valid token', function () {

        var adapterInfo = {
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

            adapterInfo.config.params.access_token = accessToken;

            ba.getAdapterInstance(adapterInfo, function (err, adapterInstance) {

                assert.ifError(err);
                assert(adapterInstance);

                adapterInstance.execute(adapterInfo.config, function (err, adapterResult) {

                    assert.ifError(err);
                    assert(adapterResult);
                    done();

                });
            });
        });

        it('get and execute adapter in one call', function (done) {

            ba.executeAdapter(adapterInfo, function (err, adapterResult) {

                assert.ifError(err);
                assert(adapterResult);
                done();

            });
        });

    });

    describe('BasicPushAdapter - get instance then execute', function () {

        var browserId;
        var pushId;
        var groupName = 'adapterTestPushGroup';

        it('registered for a push id', function (done) {

            var adapterInfo = {
                location: 'core',
                name: 'basicbridgeit',
                config: {
                    method: 'POST',
                    host: testHost,
                    service: 'push/rest',
                    account: testAccount,
                    realm: testRealm,
                    path: 'push-ids',
                    body: {
                        access_token: accessToken,
                        op: 'create'
                    }
                }
            };

            ba.getAdapterInstance(adapterInfo, function (err, adapterInstance) {

                assert.ifError(err);
                assert(adapterInstance);

                adapterInstance.execute(adapterInfo.config, function (err, adapterResult) {

                    assert.ifError(err);
                    assert(adapterResult);
//                    console.log(adapterResult);

                    assert(adapterResult.browser.id);
                    browserId = adapterResult.browser.id;

                    assert(adapterResult.push_id.id);
                    pushId = adapterResult.push_id.id;

                    done();

                });
            });
        });

        it('created a group', function (done) {

            var adapterInfo = {
                location: 'core',
                name: 'basicbridgeit',
                config: {
                    method: 'PUT',
                    host: testHost,
                    service: 'push/rest',
                    account: testAccount,
                    realm: testRealm,
                    path: 'groups/' + groupName + '/push-ids/' + pushId,
                    body: {
                        access_token: accessToken
                    }
                }
            };

            ba.getAdapterInstance(adapterInfo, function (err, adapterInstance) {

                assert.ifError(err);
                assert(adapterInstance);

                adapterInstance.execute(adapterInfo.config, function (err, adapterResult) {

                    assert.ifError(err);
                    assert(adapterResult);
                    //Succcess is a 204 status with no content
//                    console.log(adapterResult);
                    done();

                });
            });
        });

        it('sent a push', function (done) {

            var adapterInfo = {
                location: 'core',
                name: 'basicbridgeit',
                config: {
                    method: 'POST',
                    host: testHost,
                    service: 'push/rest',
                    account: testAccount,
                    realm: testRealm,
                    path: 'groups',
                    body: {
                        access_token: accessToken,
                        push_configuration: {
                            subject: 'Adapter Test',
                            detail: 'Adapter test request for push notification to ' + groupName
                        },
                        groups: [groupName, 'fakeGroupName']
                    }
                }
            };

            ba.getAdapterInstance(adapterInfo, function (err, adapterInstance) {

                assert.ifError(err);
                assert(adapterInstance);

                adapterInstance.execute(adapterInfo.config, function (err, adapterResult) {

                    assert.ifError(err);
                    assert(adapterResult);
//                    console.log(adapterResult);
                    assert(adapterResult.status);
                    assert.equal(adapterResult.status, 200);
                    assert(adapterResult.message);
                    assert.equal(adapterResult.message, 'invalidGroupNames');
                    done();

                });
            });
        });


    });

    describe('BasicPushAdapter - get and execute', function () {

        var browserId;
        var pushId;
        var groupName = 'adapterTestPushGroup';

        it('registered for a push id', function (done) {

            var adapterInfo = {
                location: 'core',
                name: 'basicbridgeit',
                config: {
                    method: 'POST',
                    host: testHost,
                    service: 'push/rest',
                    account: testAccount,
                    realm: testRealm,
                    path: 'push-ids',
                    body: {
                        access_token: accessToken,
                        op: 'create'
                    }
                }
            };

            ba.executeAdapter(adapterInfo, function (err, adapterResult) {

                assert.ifError(err);
                assert(adapterResult);
//                    console.log(adapterResult);

                assert(adapterResult.browser.id);
                browserId = adapterResult.browser.id;

                assert(adapterResult.push_id.id);
                pushId = adapterResult.push_id.id;

                done();
            });
        });

        it('created a group', function (done) {

            var adapterInfo = {
                location: 'core',
                name: 'basicbridgeit',
                config: {
                    method: 'PUT',
                    host: testHost,
                    service: 'push/rest',
                    account: testAccount,
                    realm: testRealm,
                    path: 'groups/' + groupName + '/push-ids/' + pushId,
                    body: {
                        access_token: accessToken
                    }
                }
            };

            ba.executeAdapter(adapterInfo, function (err, adapterResult) {

                assert.ifError(err);
                assert(adapterResult);
                //Succcess is a 204 status with no content
//                    console.log(adapterResult);
                done();
            });
        });

        it('sent a push', function (done) {

            var adapterInfo = {
                location: 'core',
                name: 'basicbridgeit',
                config: {
                    method: 'POST',
                    host: testHost,
                    service: 'push/rest',
                    account: testAccount,
                    realm: testRealm,
                    path: 'groups',
                    body: {
                        access_token: accessToken,
                        push_configuration: {
                            subject: 'Adapter Test',
                            detail: 'Adapter test request for push notification to ' + groupName
                        },
                        groups: [groupName, 'fakeGroupName']
                    }
                }
            };

            ba.executeAdapter(adapterInfo, function (err, adapterResult) {

                assert.ifError(err);
                assert(adapterResult);
//                    console.log(adapterResult);
                assert(adapterResult.status);
                assert.equal(adapterResult.status, 200);
                assert(adapterResult.message);
                assert.equal(adapterResult.message, 'invalidGroupNames');
                done();
            });
        });


    });

});

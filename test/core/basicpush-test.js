var should = require('should');
var assert = require('assert');
var util = require('util');
var log = util.debuglog('test');
var ba = require('../../index.js');

describe('basicpush', function () {

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

    var browserId;
    var pushId;
    var groupName = 'adapterTestPushGroup';

    it('register for a push id', function (done) {

        var pushIdSettings = {
            location: 'core',
            name: 'basicbridgeit',
            config: {
                method: 'POST',
                host: testHost,
                service: 'push/rest',
                account: testAccount,
                realm: testRealm,
                path: 'push-ids',
                params: {},
                body: {
                    access_token: accessToken,
                    op: 'create'
                }
            }
        };

        ba.executeAdapter(pushIdSettings, function (err, adapterResult) {

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

    it('create a group', function (done) {

        var createGroupSettings = {
            location: 'core',
            name: 'basicbridgeit',
            config: {
                method: 'PUT',
                host: testHost,
                service: 'push/rest',
                account: testAccount,
                realm: testRealm,
                path: 'groups/' + groupName + '/push-ids/' + pushId,
                params: {},
                body: {
                    access_token: accessToken
                }
            }
        };

        ba.executeAdapter(createGroupSettings, function (err, adapterResult) {

            assert.ifError(err);
            assert(adapterResult);
            //Succcess is a 204 status with no content
//                    console.log(adapterResult);
            done();

        });
    });

    it('send a push', function (done) {

        var sendPushSettings = {
            location: 'core',
            name: 'basicbridgeit',
            config: {
                method: 'POST',
                host: testHost,
                service: 'push/rest',
                account: testAccount,
                realm: testRealm,
                path: 'groups',
                params: {},
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

        ba.executeAdapter(sendPushSettings, function (err, adapterResult) {

            assert.ifError(err);
            assert(adapterResult);
            log(adapterResult);
            assert(adapterResult.status);
            assert.equal(adapterResult.status, 200);
            assert(adapterResult.message);
            assert.equal(adapterResult.message, 'invalidGroupNames');
            done();

        });
    });


});

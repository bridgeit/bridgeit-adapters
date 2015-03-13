var should = require('should');
var assert = require('assert');
var util = require('util');
var ld = require('lodash');
var ba = require('../index.js');

function hasErrors(results) {
    return ld.find(results, function (result) {
        var errorCheck = result.error && result.adapter;
        return !errorCheck? false: true;
    });
}

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

describe('template', function () {


    it('simple replace', function (done) {

        var temp = {
            foo: '{{bar}}'
        };

        var vals = {
            bar: 'works'
        };

        var result = ba.resolveTemplate(temp, vals);
        assert(result);
        assert(result.foo);
        assert(result.foo, vals.bar);
        done();

    });

    it('nested replace', function (done) {

        var temp = {
            top: {
                foo: '{{bar}}'
            }
        };

        var vals = {
            bar: 'works'
        };

        var result = ba.resolveTemplate(temp, vals);
        assert(result);
        assert(result.top);
        assert(result.top.foo);
        assert(result.top.foo, vals.bar);
        done();

    });

    it('replace defaults', function (done) {

        var temp = {
            top: {
                foo: '{{bar}}',
                a: '{{dbOp}}dbOperation'
            },
            b: 'something{{dot}}something'
        };

        var vals = {
            bar: 'works'
        };

        var result = ba.resolveTemplate(temp, vals);
        assert(result);
        assert(result.top);
        assert(result.top.foo);
        assert(result.top.foo, vals.bar);
        done();

    });

    it('complex replace', function (done) {

        var temp = {
            name: 'sampleAdapter',
            adapter: {
                location: 'core',
                name: 'dummy',
                config: {
                    host: '{{host}}' + ':{{port}}',
                    service: 'docs',
                    account: '{{account}}',
                    realm: '{{realm}}',
                    path: 'documents',
                    params: {
                        query: {
                            'contexts': {
                                '{{dbOp}}nin': ['{{contextId}}']
                            }
                        },
                        contextName: '{{contextId}}',
                        access_token: '{{access_token}}'
                    },
                    body: {}
                }
            }
        };

        var vals = {
            host: 'localhost',
            port: '55555',
            account: 'bridgeit_demo',
            realm: 'test',
            contextId: 'dummyId',
            access_token: 'xxxxx'
        };

        var result = ba.resolveTemplate(temp, vals);
        assert(result);
        assert(result.adapter.config.host);
        assert(result.adapter.config.host, vals.host + ':' + vals.port);
        assert(result.adapter.config.params.query.contexts['$nin']);
        assert(result.adapter.config.params.query.contexts.$nin);
        assert(result.adapter.config.params.query.contexts.$nin, 'dummyId');
        done();

    });

});

describe('adapters', function () {

    it('stub', function (done) {

        var stubSettings = {
            location: 'core',
            name: 'stub',
            config: {
                other: 'overridden other'
            }
        };

        var adapters = [stubSettings];

        ba.executeAdapters(adapters, function (err, adaptersResults) {
            assert.ifError(err);
            assert(adaptersResults);
            assert(adaptersResults.length === adapters.length);
            assert(!hasErrors(adaptersResults));
            done();
        });

    });

    it('http', function (done) {

        var http1 = {
            location: 'core',
            name: 'basichttp',
            config: {
                host: 'jsonplaceholder.typicode.com',
                path: '/posts/1'
            }
        };

        var adapters = [http1];

        ba.executeAdapters(adapters, function (err, adaptersResults) {
            assert.ifError(err);
            assert(adaptersResults);
            assert(adaptersResults.length === adapters.length);
            assert(!hasErrors(adaptersResults));
            done();
        });

    });

    it('dual http', function (done) {

        var http1 = {
            location: 'core',
            name: 'basichttp',
            config: {
                host: 'jsonplaceholder.typicode.com',
                path: '/posts/1'
            }
        };

        var http2 = {
            location: 'core',
            name: 'basichttp',
            config: {
                host: 'jsonplaceholder.typicode.com',
                path: '/posts/2'
            }
        };

        var adapters = [http1, http2];

        ba.executeAdapters(adapters, function (err, adaptersResults) {
            assert.ifError(err);
            assert(adaptersResults);
            assert(adaptersResults.length === adapters.length);
            assert(!hasErrors(adaptersResults));
            done();
        });

    });

    it('single bad host', function (done) {

        var http1 = {
            location: 'core',
            name: 'basichttp',
            config: {
                host: 'nowhereville.org',
                path: '/nonsense/path'
            }
        };

        var adapters = [http1];

        ba.executeAdapters(adapters, function (err, adaptersResults) {
            assert.ifError(err);
            assert(adaptersResults);
            //console.log(adaptersResults);
            assert(adaptersResults.length === adapters.length);
            assert(hasErrors(adaptersResults));
            done();
        });

    });

    it('dual http, one error', function (done) {

        var http1 = {
            location: 'core',
            name: 'basichttp',
            config: {
                host: 'nowhereville.org',
                path: '/nonsense/path'
            }
        };

        var http2 = {
            location: 'core',
            name: 'basichttp',
            config: {
                host: 'jsonplaceholder.typicode.com',
                path: '/posts/2'
            }
        };

        var adapters = [http1, http2];

        ba.executeAdapters(adapters, function (err, adaptersResults) {
            assert.ifError(err);
            assert(adaptersResults);
            //console.log(adaptersResults);
            assert(adaptersResults.length === adapters.length);
            assert(hasErrors(adaptersResults));
            done();
        });

    });

    it('multiple different adapters', function (done) {

        var basichttp = {
            location: 'core',
            name: 'basichttp',
            config: {
                host: 'jsonplaceholder.typicode.com',
                path: '/posts/1'
            }
        };

        var basicbridgeit = {
            location: 'core',
            name: 'basicbridgeit',
            config: {
                host: 'dev.bridgeit.io',
                service: 'auth',
                account: 'bridgeit_demo',
                realm: 'context.chat',
                path: '/token',
                params: {
                    username: 'bccu1',
                    password: 'password'
                },
                body: {}
            }
        };

        var adapters = [basichttp, basicbridgeit];

        ba.executeAdapters(adapters, function (err, adaptersResults) {
            assert.ifError(err);
            assert(adaptersResults);
            //console.log(adaptersResults);
            assert(adaptersResults.length === adapters.length);
            assert(!hasErrors(adaptersResults));
            done();
        });

    });

});


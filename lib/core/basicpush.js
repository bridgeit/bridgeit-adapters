var url = require('url');
var BasicBridgeItAdapter = require('./basicbridgeit');
var ld = require('lodash');
var util = require('util');
var log = util.debuglog('adapters');


var wrappedAdapter;

/**
 * An adapter is basically something that can send a request and get a response.  They
 * vary in the configuration values that they accept and process but they all follow the
 * basic pattern of execute(params, cb) where the adapter will execute a request using the
 * supplied parameters.  At a minimum, the params will contain a config property which
 * contains all the necessary values and settings for executing the request.
 *
 * This adapter is a very basic Push adapter for triggering notifications via the
 * Notification service via the REST API. This is an example of creating a wrapper
 * around the BasicHTTPAdapter that is specialized for a particular service.
 *
 * @constructor
 */
function BasicPushAdapter() {
    wrappedAdapter = new BasicBridgeItAdapter();
}
module.exports = BasicPushAdapter;


BasicPushAdapter.prototype.validateConfig = function (config) {

    wrappedAdapter.validateConfig(config);

    if (!config.body) {
        console.error('missing body');
        return false;
    }

    if (!config.body.access_token) {
        console.error('missing access_token in body');
        return false;
    }

    if (!config.body.push_configuration) {
        console.error('missing push configuration in body');
        return false;
    }

    return true;
};


BasicPushAdapter.prototype.execute = function (params, cb) {

    //Merge incoming configuration - overriding any defaults.
    var defaultConfig = {
        method: 'POST',
        scheme: 'http',
        host: 'web1',
        service: 'push/rest',
        path: 'groups',
        params: {},
        headers: {
            'Content-type': 'application/json; charset=utf-8'
        },
        body: {
            access_token: null,
            push_configuration: {
                subject: "No subject provided (BasicPushAdapter)",
                detail: "No detail provided (BasicPushAdapter)"
            },
            groups: params.config && params.config.context && params.config.context.users ? params.config.context.users : []
        }
    };

    if (!params.config) {
        params.config = {};
    }

    params.config = ld.merge(defaultConfig, params.config);
    log('BasicPushAdapter params', JSON.stringify(params));

    wrappedAdapter.execute(params, function (err, results) {
        if (err) {
            cb(err);
            return;
        }
        cb(null, results);
    });
};

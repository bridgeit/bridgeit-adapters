var url = require('url');
var WebSock = require('ws');
var ld = require('lodash');
var util = require('util');
var log = util.debuglog('adapters');

/**
 * An adapter is basically something that can send a request and get a response.  They
 * vary in the configuration values that they accept and process but they all follow the
 * basic pattern of execute(params, cb) where the adapter will execute a request using the
 * supplied parameters.  At a minimum, the params will contain a config property which
 * contains all the necessary values and settings for executing the request.
 *
 * This adapter is a very basic WebSocket adapter which uses the WebSocket protocol for
 * making a request, carrying an optional payload.  The intent is mainly to simply send
 * a message, not to open up a long-lived line of 2-way communication.
 *
 * @constructor
 */
function BasicWebSocketAdapter() {
    log('BasicWebSocketAdapter constructor');
}
module.exports = BasicWebSocketAdapter;

/**
 * Execute this adapter.
 *
 * @param {Object} params Object containing the required parameters
 * @param {String} params.config All required configuration information for this adapter.
 * @returns The callback returns with the results from a successful execution or an error.
 *
 */
BasicWebSocketAdapter.prototype.execute = function (params, cb) {

    var defaultConfig = {
        scheme: 'ws',
        host: 'dev.bridgeit.io',
        queryParams: {},
        headers: {
            'Content-type': 'application/json; charset=utf-8'
        },
        body: {}
    };

    if (!params.config) {
        params.config = {};
    }

    //Merge incoming configuration overriding any defaults.
    var config = ld.merge(defaultConfig, params.config);

    //Remove the leading slash on the path if there is one
    if (config.path && config.path.indexOf('/') === 0) {
        config.path = config.path.substring(1);
    }
    log('BasicWebSocketAdapter config: ', config);

    var rawURL = config.scheme + '://' + config.host + '/' + config.path;
    var parsedURL = url.parse(rawURL);
    log('BasicWebSocketAdapter URL: ', parsedURL);

    if (!params.config.body) {
        params.config.body = {};
    }

    var ws = new WebSock(parsedURL);

    //For this simple case, just open, send, and close.
    ws.on('open', function () {
        ws.send(params.body.message, function (wsError) {
            if (wsError) {
                log('BasicWebSocketAdapter error: ', wsError);
                cb(wsError);
                return;
            }
            cb(null, params.body.message);
        });
    });

};
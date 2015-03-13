var url = require('url');
var httpClient = require('superagent');
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
 * This adapter is a very basic HTTP adapter which uses the HTTP protocol for
 * making a request, sending an optional payload if provided.
 *
 * @constructor
 */
function BasicHTTPAdapter() {
    log('BasicHTTPAdapter constructor');
}
module.exports = BasicHTTPAdapter;


/**
 * Execute this adapter.
 *
 * @param {Object} params Object containing the required parameters
 * @param {String} params.config All required configuration information for this adapter.
 * @returns The callback returns with the results from a successful execution or an error.
 *
 */
BasicHTTPAdapter.prototype.execute = function (params, cb) {

    var defaultConfig = {
        method: 'GET',
        scheme: 'http',
        host: 'dev.bridgeit.io',
        params: {},
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

    log('BasicHTTPAdapter config: ', config);

    var rawURL = config.scheme + '://' + config.host + '/' + config.path;
    var parsedURL = url.parse(rawURL);
    log('BasicHTTPAdapter URL: ', parsedURL);

    var serviceRequest = httpClient(config.method, parsedURL)
        .set(config.headers)
        .query(config.params);

    if (config.method === 'POST' || config.method === 'PUT') {
        serviceRequest = serviceRequest.send(config.body);
    }

    serviceRequest.end(function (err, res) {

        if(err){
            cb(err);
            return;
        }

        cb(null, res.body);
    });

};
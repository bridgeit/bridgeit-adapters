var url = require('url');
var httpClient = require('superagent');
var ld = require('lodash');

/**
 * A basic HTTP Adapter for making requests.  This is very plain at the moment and should
 * likely be reviewed to ensure that we are validating/escaping everything we should.
 *
 * @constructor
 */
function BasicHTTPAdapter() {
//    console.log('BasicHTTPAdapter constructor');
}
module.exports = BasicHTTPAdapter;


BasicHTTPAdapter.prototype.execute = function (userConfig, cb) {

    var config = {
        method: 'GET',
        scheme: 'http',
        host: 'dev.bridgeit.io',
        params: {},
        headers: {
            'Content-type': 'application/json; charset=utf-8'
        },
        body: {}
    };

    if (userConfig) {
        config = ld.merge(config, userConfig);
    }

    //Remove the leading slash on the path if there is one
    if(config.path && config.path.indexOf('/') === 0){
        config.path = config.path.substring(1);
    }

    console.log('BasicHTTPAdapter config: ', config);

    var rawURL = config.scheme + '://' + config.host + '/' + config.path;
    var parsedURL = url.parse(rawURL);
    console.log('BasicHTTPAdapter URL: ', parsedURL);

    //Online docs for using 'superagent' as the HTTP(S) client
    //   http://visionmedia.github.io/superagent/

    var serviceRequest = httpClient(config.method, parsedURL)
        .set(config.headers)
        .query(config.params);

    if (config.method === 'POST' || config.method === 'PUT') {
        serviceRequest = serviceRequest.send(config.body);
    }

    serviceRequest.end(function (res) {
        cb(null, res.body);
    });

};
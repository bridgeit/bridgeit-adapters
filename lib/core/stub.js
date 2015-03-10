var ld = require('lodash');


/**
 * An adapter is basically something that can send a request and get a response.  They
 * vary in the configuration values that they accept and process but they all follow the
 * basic pattern of execute(params, cb) where the adapter will execute a request using the
 * supplied parameters.  At a minimum, the params will contain a config property which
 * contains all the necessary values and settings for executing the request.
 *
 * This adapter is a diagnostic adapter only.
 *
 * @constructor
 */
function StubAdapter() {
//    console.log('StubAdapter constructor');
}
module.exports = StubAdapter;


StubAdapter.prototype.execute = function (params, cb) {

    var defaultConfig = {
        name: 'StubAdapter',
        something: 'default something',
        other: 'default other'
    };

    if (!params.config) {
        params.config = {};
    }

    //Merge incoming configuration overriding any defaults.
    var config = ld.merge(defaultConfig, params.config);

    //Remove the leading slash on the path if there is one
    if(config.path && config.path.indexOf('/') === 0){
        config.path = config.path.substring(1);
    }

    cb(null, config);

};
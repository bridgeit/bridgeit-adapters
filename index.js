var ld = require('lodash');

var requiredAdapterParams = ['name', 'location', 'config'];


function validateParams(params) {

    if (!params) {
        throw new Error('no parameters');
    }

    var paramKeys = ld.keys(params);
    var missing = ld.difference(requiredAdapterParams, paramKeys);

    if (!ld.isEmpty(missing)) {
        throw new Error('missing required parameters: ' + missing);
    }
}


function getAdapterInstance(params, cb) {

    try {
        validateParams(params);
    } catch (paramValidationError) {
        cb(paramValidationError);
        return;
    }

    //Right now this just gets adapters that are currently local to this module and accessible
    //via the normal require() calls but it could be improved to get modules based on URLs, etc.
    if (params.location === 'core') {
        getCoreAdapterInstance(params.name, function (err, instance) {
            if (err) {
                console.error(err);
                cb(err);
                return;
            }
            cb(null, instance);
        });
        return;
    }

    var errMsg = 'only core adapters are currently supported';
    console.error(errMsg);
    cb(new Error(errMsg + '  ' + params));
}
module.exports.getAdapterInstance = getAdapterInstance;


function getCoreAdapterInstance(name, cb) {

    //Default to the BasicBridgeItAdapter
    if (!name) {
        name = 'basicbridgeit';
    }

    var AdapterConstructor;
    try {
        AdapterConstructor = require('./lib/core/' + name);
    } catch (e) {
        cb(new Error('could not get core adapter: ' + name + '  ' + e.message));
        return;
    }

    var adapterInstance = new AdapterConstructor();
    if (!adapterInstance) {
        cb(new Error('could not create adapter instance: ' + name));
        return;
    }

    cb(null, adapterInstance);
}
module.exports.getCoreAdapterInstance = getCoreAdapterInstance;


/**
 * Provide the name (e.g. basicbridgeit) and location (e.g. core) of the
 * adapter as well as the configuration settings.  This function will use
 * the information to get an instance of the adapter, execute it using the
 * configuration, and return the results.
 *
 * @param params
 * @param cb
 */

/**
 * Execute a named adapter.
 *
 * @param {Object} adapterParams Object containing the required parameters
 * @param {String} adapterParams.name The name of the adapter as used by require() (e.g. basicbridgeit).
 * @param {String} adapterParams.location The location of the adapter (currently only 'core' is supported).
 * @param {Object} adapterParams.config An object with all the required settings for executing the adapter.
 * @returns The results from a successful execution or an error.
 *
 */
function executeAdapter(adapterParams, cb) {

    if (!adapterParams || !adapterParams.name || !adapterParams.location || !adapterParams.config) {
        cb(new Error('requestBadParameter', 'missing adapter parameters'));
        return;
    }

    getAdapterInstance(adapterParams, function (instanceErr, adapterInstance) {

        if (instanceErr || !adapterInstance) {
            cb(instanceErr);
            return;
        }

        adapterInstance.execute(adapterParams.config, function (responseErr, adapterResponse) {

            if (responseErr) {
                cb(responseErr);
                return;
            }

            cb(null, adapterResponse);

        });
    });

}
module.exports.executeAdapter = executeAdapter;



var ld = require('lodash');
var expand = require('json-templater/object');
var async = require('async');
var util = require('util');
var log = util.debuglog('adapters');


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
 * Resolves any templated values in an Object with the values specified in another Object.
 *
 * @param {Object} template Object containing the templated sections (e.g. {{foo}}).
 * @param {Object} values Object containing the values to substitute into the template (e.g. { foo:bar }.
 * @returns An object with the templated parts replaced with the values.
 *
 */
function resolveTemplate(template, values) {

    //Some default expansion values that always get expanded.
    var defaultExpansionValues = {
        dot: '.',
        dbOp: '$',
        boolTrue: 'true',
        boolFalse: 'false'
    };

    var expanded = expand(template, defaultExpansionValues);

    if(values){
        expanded = expand(expanded, values);
    }

    return expanded;
}
module.exports.resolveTemplate = resolveTemplate;


/**
 * Execute a named adapter.
 *
 * @param {Object} adapter Object containing the required parameters
 * @param {String} adapter.name The name of the adapter as used by require() (e.g. basicbridgeit).
 * @param {String} adapter.location The location of the adapter (currently only 'core' is supported).
 * @param {Object} adapter.config An object with all the required settings for executing the adapter.
 * @returns The results from a successful execution or an error.
 *
 */
function executeAdapter(adapter, cb) {

    if (!adapter || !adapter.name || !adapter.location || !adapter.config) {
        cb(new Error('requestBadParameter', 'missing adapter parameters'));
        return;
    }

    getAdapterInstance(adapter, function (instanceErr, adapterInstance) {

        if (instanceErr || !adapterInstance) {
            cb(instanceErr);
            return;
        }

        adapterInstance.execute(adapter, function (responseErr, adapterResponse) {

            if (responseErr) {
                cb(responseErr);
                return;
            }

            cb(null, adapterResponse);

        });
    });

}
module.exports.executeAdapter = executeAdapter;

/**
 * Execute an array of named adapters with their associated configurations.  The execution is done
 * in parallel.  All template expansion/resolution needs to be done before calling this function.
 * If the adapter should be sending some information, it should be included as part of the configuration,
 * typically in adapter.config.body.
 *
 * @param {Array} adapters An array of named adapters and their associated configurations.
 *
 * @returns The accumulated results from executing all the adapters.
 *
 */
function executeAdapters(adapters, cb) {

    async.map(adapters, function (currentAdapter, requestCallback) {

            executeAdapter(currentAdapter, function (err, adapterResponse) {

                if (err) {
                    //If there is an error, just return it as an object so that we don't
                    //short circuit the other adapters.
                    adapterResponse = {adapter: currentAdapter, error: err};
                }

                requestCallback(null, adapterResponse);
            });

        },
        function (err, resultsArray) {

            if (err) {
                cb(err);
                return;
            }

            cb(null, resultsArray);
        }
    );
}
module.exports.executeAdapters = executeAdapters;




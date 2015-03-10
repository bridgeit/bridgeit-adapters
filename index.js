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

        adapterInstance.execute(adapterParams, function (responseErr, adapterResponse) {

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
 * and parallel.
 *
 * @param {Array} adapters array of named adapters and their associated configurations
 * @returns The results from executing.
 *
 */
function executeAdapters(adapters, templateValues, cb) {

    async.map(adapters, function (currentRequest, requestCallback) {

            //Before executing an adapter, we need to replace any dynamic template
            //values in the config section.  First we replace the basics.
            //TODO: Use service token rather than user's token.
            var expansionValues = {
                dot: '.',
                dbOp: '$',
                account: barrel.accountId,
                realm: barrel.realmId,
                access_token: barrel.accessToken,
                contextId: barrel.contextId,
                boolTrue: 'true',
                boolFalse: 'false'
            };
            logger.debug('default expansion values:', JSON.stringify(expansionValues, null, 4));
            currentRequest.adapter.config = expand(currentRequest.adapter.config, expansionValues);
            currentRequest.adapter.config.context = {};

            //The payload of the request can contain custom values supplied
            //by the user.  We need to be careful here as we don't want to let
            //rogue code loose.
            //TODO: validate expansion values
            if (barrel.payload) {
                var userExpansionValues = barrel.payload;
                logger.debug('user expansion values:', JSON.stringify(userExpansionValues, null, 4));
                currentRequest.adapter.config = expand(currentRequest.adapter.config, userExpansionValues);
                currentRequest.adapter.config.context.properties = userExpansionValues;
            }

            if(barrel.requestsData){

                if(barrel.requestsData.users){
                    currentRequest.adapter.config.context.users = barrel.requestsData.users;
                }

                if(barrel.requestsData.data){
                    currentRequest.adapter.config.context.data = barrel.requestsData.data;
                }
            }

            logger.debug('final expanded request:\n', JSON.stringify(currentRequest, null, 4));

            badapts.executeAdapter(currentRequest.adapter, function (err, adapterResponse) {

                if (err) {
                    logger.error('could not execute request', currentRequest.name, err);
                    requestCallback(err);
                    return;
                }

                logger.debug('response', currentRequest.name, adapterResponse);

                var parsedResponse = typeof adapterResponse === 'string' ? JSON.parse(adapterResponse) : adapterResponse;
                var taggedResponse = parsedResponse;
                if (!ld.isArray(parsedResponse)) {
                    taggedResponse = {};
                    taggedResponse[currentRequest.name] = parsedResponse;
                }
                logger.debug('final results for ' + currentRequest.name, taggedResponse);
                requestCallback(null, taggedResponse);
            });

        },
        function (err, cummulativeRequestResults) {

            if (err) {
                //Not sure if we should kill the whole thing or let it keep going with the
                //data it did accumulate.
                logger.error(err);
                cb(err);
                return;
            }

            logger.debug('completed requests:', cummulativeRequestResults);
            cb(null, cummulativeRequestResults);
        }
    );
}
module.exports.executeAdapters = executeAdapters;




var url = require('url');
var http = require('http');
var https = require('https');
var httpClient = require('request');
var qs = require('querystring');
var ld = require('lodash');


function BasicAdapter() {
}
module.exports = BasicAdapter;


BasicAdapter.prototype.validateConfig = function (config) {

    if (!config.host) {
        console.error('missing host');
        return false;
    }

    if (!config.service) {
        console.error('missing service');
        return false;
    }

    if (!config.account) {
        console.error('missing account');
        return false;
    }

    if (!config.realm) {
        console.error('missing realm');
        return false;
    }

    if (!config.path) {
        console.error('missing path');
        return false;
    }

    return true;
};


BasicAdapter.prototype.execute = function (userConfig, cb) {

    var config = {
        method: 'GET',
        scheme: 'http',
        host: 'web1',
        params: {},
        headers: {
            'Content-type': 'application/json; charset=utf-8'
        },
        body: {}
    };

    if (userConfig) {
        config = ld.merge(config, userConfig);
    }

    console.log('BasicAdapter config: ', config);

    if (!this.validateConfig(config)) {
        console.error('invalid configuration', config);
        return;
    }

    var dest = config.scheme + '://' + config.host + '/' + config.service + '/' + config.account + '/realms/' + config.realm + '/' + config.path;
    var parsedURL = url.parse(dest);
    console.log('BasicAdapter URL: ', parsedURL);

    var options = {
        url: parsedURL,
        headers: config.headers,
        method: config.method,
        qs: config.params
    };

    if (config.method === 'POST' || config.method === 'PUT') {
        options.body = JSON.stringify(config.body);
    }

    console.log('BasicAdapter options: ', options);

    //Online docs for using 'request' as the HTTP(S) client
    //  https://github.com/request/request
    httpClient(options, function (err, resp, body) {

        if (err) {
            console.log('error', err);
            return;
        }

        //If there is no data "extract" property, then just return everything as is.
        if (!config.extract) {
            cb(null, body);
            return;
        }

        //If there is an "extract" property, then get the data - parse if required.
        var theData = typeof body === 'string' ? JSON.parse(body) : body;
        console.log('extract', config.extract, ' from ', theData);

        //If it's not an array, convert to a single item array.
        if (!ld.isArray(theData)) {
            theData = [theData];
        }

        //Create an array to hold our extracted information.
        var extractions = [];

        //Go through the array and, for each record, extract the relevant
        //information and add it to our collection.
        theData.forEach(function (record, index, array) {

            //Loop through each extract value and pick out the value to add to our
            //array.  Nested properties can be done using "a.b.c.d" notation.
            config.extract.forEach(function (exPropName, exIndex, exArray) {
                var extracted = getProperty(exPropName, record);
                console.log('extracted record', extracted);
                if (extracted && !ld.isEmpty(extracted)) {
                    extractions.push(extracted);
                }
            });
        });

        console.log('extracted collection', extractions);

        cb(null, extractions);

    });
};


function getProperty(propertyName, object) {
    var parts = propertyName.split(".");
    var length = parts.length;
    var property = object || this;

    var index;
    for (index = 0; index < length; index++) {
        property = property[parts[index]];
    }

    return property;
}

//Test by creating an adapter and running a test. This gets an access_token from a certain
//account + realm so you may need to adjust for your environment.

//var tokenConfig = {
//    host: 'localhost:55010',
//    service: 'auth',
//    account: 'bridgeit_demo',
//    realm: 'context.chat',
//    path: 'token',
//    params: {
//        username: 'bccu1',
//        password: 'password'
//    }
//
//};
////console.log('tokenConfig', tokenConfig);
//
//var adapter = new BasicAdapter();
//adapter.execute(tokenConfig, function (err, response) {
//    if (err) {
//        console.log('error: ', err);
//    }
//    console.log('response: ', response);
//
//    var access_token = JSON.parse(response).access_token;
//
//    var contextConfig = {
//        host: 'localhost:55060',
//        service: 'context',
//        account: 'bridgeit_demo',
//        realm: 'context.chat',
//        path: 'users',
//        params: {
//            query: {
//                "state.status": "active"
//            },
//            access_token: access_token
//        },
//        extract: ["info.name"]
//    };
//
//    var usersAdapter = new BasicAdapter();
//    usersAdapter.execute(contextConfig, function (err, response) {
//        if (err) {
//            console.log('error: ', err);
//        }
//        console.log('response: ', response);
//
//    });
//
//
//});

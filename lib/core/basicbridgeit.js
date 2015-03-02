/*
 * ICESOFT COMMERCIAL SOURCE CODE LICENSE V 1.1
 *
 * The contents of this file are subject to the ICEsoft Commercial Source
 * Code License Agreement V1.1 (the "License"); you may not use this file
 * except in compliance with the License. You may obtain a copy of the
 * License at
 * http://www.icesoft.com/license/commercial-source-v1.1.html
 *
 * Software distributed under the License is distributed on an "AS IS"
 * basis, WITHOUT WARRANTY OF ANY KIND, either express or implied. See the
 * License for the specific language governing rights and limitations under
 * the License.
 *
 * Copyright 2009-2014 ICEsoft Technologies Canada, Corp. All Rights Reserved.
 */

var url = require('url');
var httpClient = require('superagent');
var ld = require('lodash');


function BasicBridgeItAdapter() {
//    console.log('BasicBridgeItAdapter constructor');
}
module.exports = BasicBridgeItAdapter;


BasicBridgeItAdapter.prototype.validateConfig = function (config) {

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


BasicBridgeItAdapter.prototype.execute = function (userConfig, cb) {

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

    //Remove the leading slash on the path if there is one
    if (config.path && config.path.indexOf('/') === 0) {
        config.path = config.path.substring(1);
    }

//    console.log('BasicBridgeItAdapter config: ', config);

    if (!this.validateConfig(config)) {
        console.error('invalid configuration', config);
        return;
    }

    var dest = config.scheme + '://' +
        config.host + '/' +
        config.service + '/' +
        config.account + '/realms/' +
        config.realm + '/' +
        config.path;
    var parsedURL = url.parse(dest);

    //Online docs for using 'superagent' as the HTTP(S) client
    //   http://visionmedia.github.io/superagent/

    var serviceRequest = httpClient(config.method, parsedURL)
        .set(config.headers)
        .query(config.params);

    if (config.method === 'POST' || config.method === 'PUT') {
        serviceRequest = serviceRequest.send(config.body);
    }

    console.log('BasicBridgeItAdapter request:\n', config.method, parsedURL.href, config.params, '\n', config.body);

    serviceRequest.end(function (res) {

        var payload = res.body;

        //Should be JSON but if the Content-Type is not set to JSON then our client
        //will not process it as such.  In that case, we check to see if there is something
        //in the "text" property and use that.
        if (ld.isEmpty(payload) && res.text) {
            try {
                payload = JSON.parse(res.text);
            } catch (e) {
                //If text can not be parsed as JSON then we likely have an error from the server.
                console.error('invalid configuration', config);
                cb(e);
                return;
            }
        }

        //If there an "extract" property, pull out the designated properties
        if (config.extract) {
            payload = extract(payload, config.extract);
        }

        console.log('\n\n--**-- RESPONSE --**--' + res.status + '\n', payload);
        cb(null, payload);
    });

};


//function getQueryString(params) {
//
//    console.log('getting query string', params);
//
//    var fqs = '';
//    var theKeys = Object.keys(params);
//
//    theKeys.forEach(function (key, index, array) {
//        var keyString = key.toString();
//        var rawVal = params[keyString];
//        if(ld.isObject(rawVal)){
//            rawVal = JSON.stringify(rawVal);
//        }
//        fqs += key.toString() + '=' + encodeURIComponent(rawVal) + '&';
//    });
//
//    return fqs;
//}


function getProperty(theObj, propertyName) {

    console.log('getting property', propertyName);

    var property = theObj || this;

    var parts = propertyName.split(".");
    var length = parts.length;

    var index;
    for (index = 0; index < length; index++) {
        if (!property[parts[index]]) {
            return null;
        }

        property = property[parts[index]];
    }

    return property;
}


//function setProperty(theObj, propertyName, propertyValue) {
//
//    console.log('setting property', propertyName, propertyValue);
//
//    var parts = propertyName.split(".");
//    if (parts.length < 2) {
//        theObj[parts[0]] = propertyValue;
//    } else {
//        if (!theObj[parts[0]]) {
//            theObj[parts[0]] = {};
//        }
//        theObj = theObj[parts.shift()];
//        setProperty(theObj, parts.join("."), propertyValue);
//    }
//}


//function extract(rawData, propsToExtract) {
//
//    //If there is an "extract" property, then get the data - parse if required.
//    var parsedData = typeof rawData === 'string' ? JSON.parse(rawData) : rawData;
//    console.log('extract', propsToExtract, ' from ', parsedData);
//
//    //If it's not an array, convert to a single item array.
//    if (!ld.isArray(parsedData)) {
//        parsedData = [parsedData];
//    }
//
//    //Create an array to hold our extracted information.
//    var extractions = [];
//
//    //Go through the array and, for each record, extract the relevant
//    //information and add it to our collection.
//    parsedData.forEach(function (record, index, array) {
//        var pickedRecord = ld.pick(record, propsToExtract);
//        console.log('picked record', pickedRecord);
//        extractions.push(pickedRecord);
//    });
//
//    return extractions;
//}

function extract(rawData, propsToExtract) {

    //If there is an "extract" property, then get the data - parse if required.
    var parsedData = typeof body === 'string' ? JSON.parse(rawData) : rawData;
    console.log('extract', propsToExtract, ' from ', parsedData);

    //If it's not an array, convert to a single item array.
    if (!ld.isArray(parsedData)) {
        parsedData = [parsedData];
    }

    //Create an array to hold our extracted information.
    var extractions = [];

    //Go through the array and, for each record, extract the relevant
    //information and add it to our collection.
    parsedData.forEach(function (record, index, array) {

        //Loop through each extract value and pick out the value to add to our
        //array.  Nested properties can be done using "a.b.c.d" notation.

        //TODO: We can extract the properties and set them 'as is' on a new object
        //or we can just return the values.  For now, we'll just return the values.

        //-----
        //This is the logic of returning an object that contains the extracted subset
        //of properties.

//        var extractedRecord = {};

//        propsToExtract.forEach(function (exPropName, exIndex, exArray) {
//            var exPropVal = getProperty(record, exPropName);
//
//            if (exPropVal) {
//                setProperty(extractedRecord, exPropName, exPropVal);
//            }
//            console.log('extracted property', exPropName, ' = ', exPropVal);
//        });
//
//        extractions.push(extractedRecord);
        //-----

        propsToExtract.forEach(function (exPropName, exIndex, exArray) {
            var exPropVal = getProperty(record, exPropName);

            if (exPropVal) {
                extractions.push(exPropVal);
            }
            console.log('extracted property', exPropName, ' = ', exPropVal);
        });

    });

    return extractions;

}
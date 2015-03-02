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
var BasicBridgeItAdapter = require('./basicbridgeit');
var ld = require('lodash');


var wrappedAdapter;
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


BasicPushAdapter.prototype.execute = function (userConfig, cb) {

    var config = {
        method: 'POST',
        scheme: 'http',
        host: 'web1',
        service: 'push/rest',
        path: 'groups',
        params: {},
        headers: {
            'Content-type': 'application/json; charset=utf-8'
        }
    };

    if (userConfig) {
        config = ld.merge(config, userConfig);
    }

    console.error('basicpush config', config);

    if(config.context && config.context.users){
        config.body.groups = config.context.users;
    }

    wrappedAdapter.execute(config, function (err, results) {
        if (err) {
            cb(err);
            return;
        }
        cb(null, results);
    });
};

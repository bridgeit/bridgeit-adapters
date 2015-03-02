var ld = require('lodash');


function StubAdapter() {
//    console.log('StubAdapter constructor');
}
module.exports = StubAdapter;


StubAdapter.prototype.execute = function (userConfig, cb) {

    var config = {
        name: 'StubAdapter',
        something: 'default something',
        other: 'default other'
    };

    if (userConfig) {
        config = ld.merge(config, userConfig);
    }

    cb(null, config);

};
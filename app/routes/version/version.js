'use strict';
var _ = require('lodash');

var version = rootRequire('version.json');

/**
 * get current software version of backend
 */
exports.getVersion = function (req, res) {
    res.json(version);
};

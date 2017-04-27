'use strict';
var path = require('path');

/**
 * require a module relative to the application root
 *
 * @param name {string} the module path, relative to the application root, e.g. 'config/settings'
 * @returns {*} the require'd result
 */
global.appRoot = path.dirname(require.main.filename);

global.rootRequire = function (name) {
    return require(path.resolve(appRoot, name));
};
global.routeRequire = function (name) {
    return require(path.resolve(appRoot, 'routes', name));
};

global.logger = require(path.resolve(appRoot, 'utils/logger'));

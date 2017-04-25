'use strict';
var config = rootRequire('config/config');

var user;

/**
 * sets the current username
 *
 * @param username {string} the username to be set
 */
exports.setUser = function (username) {
    user = username;
};


/**
 * retrieves the current username
 *
 * @return {string} the current username
 */
exports.getUser = function () {
    return user;
};

// set default user
exports.setUser(config.cas.userId);

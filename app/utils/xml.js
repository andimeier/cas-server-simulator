'use strict';

/**
 * Utility class.
 * @class xml
 * @type {exports}
 */
var xmlbuilder = require('xmlbuilder');


/**
 * assemble a "successful authentication" XML message
 *
 * @param userId {string} the user name to be used in the XML message
 * @returns {string} the "success" XML message
 */
exports.success = function (userId) {
    return '<cas:serviceResponse xmlns:cas="http://www.yale.edu/tp/cas">' +
        '<cas:authenticationSuccess>' +
        '<cas:user>' + userId + '</cas:user>' +
        '<cas:proxyGrantingTicket>PGTIOU-123456-test-test-test</cas:proxyGrantingTicket>' +
        '</cas:authenticationSuccess>' +
        '</cas:serviceResponse>';
};


/**
 * assemble a "authentication failure" XML message
 *
 * @param code {string} the error reason
 * @param message {string} the error message
 * @param ticket {string} the ticket which has been rejected
 * @returns {string} the "success" XML message
 */
exports.fail = function (code, message, ticket) {
    return '<cas:serviceResponse xmlns:cas="http://www.yale.edu/tp/cas">' +
        '<cas:authenticationFailure code="' + code + '">' +
        message +
        '</cas:authenticationFailure>' +
        '</cas:serviceResponse>';
};

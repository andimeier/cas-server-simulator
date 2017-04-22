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
        '<cas:proxyGrantingTicket>PGTIOU-84678-8a9d...</cas:proxyGrantingTicket>' +
        '</cas:authenticationSuccess>' +
        '</cas:serviceResponse>';
};


/**
 * assemble a "successful authentication" XML message
 *
 * @param reason {string} the error reason
 * @param ticket {string} the ticket which has been rejected
 * @returns {string} the "success" XML message
 */
exports.fail = function (reason, ticket) {
    return '<cas:serviceResponse xmlns:cas="http://www.yale.edu/tp/cas">' +
        '<cas:authenticationFailure code="' + reason + '">' +
        'Ticket ' + ticket + ' not recognized' +
        '</cas:authenticationFailure>' +
        '</cas:serviceResponse>';
};

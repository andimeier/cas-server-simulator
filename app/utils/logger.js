'use strict';
var winston = require('winston');
var config = rootRequire('config/config');

/**
 * set up server globals, e.g. logger, mysql
 *
 * @return {object} logger objects
 */
var logger = new (winston.Logger)({
    transports: [
        new (winston.transports.Console)({
            level: config.logLevel,
            handleExceptions: true,
            timestamp: true,
            colorize: false
        })
    ]
});

module.exports = logger;

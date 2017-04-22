'use strict';
var winston = require('winston');
var mysql = require('mysql');

var path = require('path');
var config = rootRequire('config/config');

/**
 * set up server globals, e.g. logger, mysql
 *
 * @return {object} logger objects
 */
exports.getLogger = function () {
    var logger;

    // production settings for logging
    logger = new (winston.Logger)({
        transports: [
            new (winston.transports.Console)({
                level: config.logLevel,
                handleExceptions: true,
                timestamp: true,
				colorize: false
            })
        ]
    });

    return logger;
};


/**
 * set up DB pool
 *
 * @return {object} DB pool
 */
exports.getDbPool = function () {
    var dbPool;

    // global MySql connection pool
    dbPool = mysql.createPool({
        host: config.db.host,
        user: config.db.user,
        password: config.db.password,
        database: config.db.database,
        connectionLimit: 10,
        connectTimeout: 20000,
        acquireTimeout: 20000,
        dateStrings: true // don't convert date fields into Date objects (since
        // it would make the process vulnerable due to implicit, automatic timezone
        // conversions. We do not want that, so let's treat these fields simply as
        // strings.
    });

	// probe db connection and bail out if it does not work
	dbPool.getConnection(function (err, connection) {
		if (err) {
			logger.error(err.stack);
			// fatal error => bail out
			throw new Error(err);
		}
	});
	
    return dbPool;
};

'use strict';
var express = require('express');
var session = require('express-session');
var path = require('path');


/**
 * require a module relative to the application root
 * 
 * @param name {string} the module path, relative to the application root, e.g. 'config/settings'
 * @returns {*} the require'd result
 */
global.rootRequire = function (name) {
    return require(path.resolve(__dirname, name));
};

var setup = require('./utils/setup');
global.logger = setup.getLogger();

// configs
var config = rootRequire('config/config');


// router
var mainRouter = require('./routes/mainRouter');


//TODO CONFIG??
process.env['NODE_TLS_REJECT_UNAUTHORIZED'] = '0';

var app = express();


// ------ routes ------

app.use(function (req, res, next) {
    console.log('----> incoming request: ' + req.originalUrl);
    next();
});

app.use('/', mainRouter);

app.use(function (req, res) {
    logger.verbose('Unrecognized route: ', {url: req.originalUrl}, JSON.stringify(new Error().stack, null, 2));
    res.sendStatus(404);
});


// ------ start the server ------

app.listen(config.port, config.listenOn);
logger.info('Listening on port ' + config.port + (config.listenOn ? ' on ' + config.listenOn : '') + ' ...');

exports.app = app;

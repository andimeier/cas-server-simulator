'use strict';
var express = require('express');
var path = require('path');

require('./utils/setGlobals');

var serviceTickets = rootRequire('utils/serviceTickets');

// configs
var config = rootRequire('config/config');


// router
var mainRouter = routeRequire('mainRouter');


//TODO CONFIG??
process.env['NODE_TLS_REJECT_UNAUTHORIZED'] = '0';

var app = express();


// ------ routes ------
app.use('/css', express.static(path.join(__dirname, 'public/css')));

app.use(function (req, res, next) {
    logger.silly('----> incoming request: ' + req.originalUrl);
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


/**
 * clear obsolete tickets from time to time
 *
 * use setTimeout instead of setInterval in order to make sure that
 * there can be no overlapping execution of two instances of the
 * periodic job
 */
function periodicClean() {

    serviceTickets.removeExpiredTickets();

    // schedule next task
    setTimeout(periodicClean, 1000 * 60 * config.removeObsoleteTicketsInterval);
}


periodicClean();

'use strict';
var url = require('url');
var randomstring = require('randomstring');
var _ = require('lodash');
var handlebars = require('handlebars');
var fs = require('fs');
var path = require('path');

var config = rootRequire('config/config');

var xml = rootRequire('utils/xml');
var tickets = rootRequire('utils/serviceTickets');



/**
 * simulate positive CAS login
 *
 * @param req
 * @param res
 */
exports.login = function (req, res) {

    if (!req.query.service) {
        res.status(400).send('missing parameter "service"');
        return;
    }

    renderLoginForm(res, req.query.service);
};


/**
 * process submitted login data
 *
 * @param req
 * @param res
 */
exports.submitLoginForm = function (req, res) {
    logger.verbose('in submitLoginForm ...');
    var ticket;

    if (!req.query.service) {
        res.status(400).send('missing parameter "service"');
        return;
    }

    if (!req.query.username) {
        res.status(400).send('missing form parameter "username"');
        return;
    }


    // generate service ticket
    ticket = tickets.generateServiceTicket(req.query.service, req.query.username).ticket;

    // redirect with added ticket as query parameter
    let serviceUrl = url.parse(req.query.service, true);
    serviceUrl.query.ticket = ticket;
    res.redirect(serviceUrl.format());
};



/**
 * renders the login form
 *
 * @param res
 * @param service {string} the requesting service
 */
function renderLoginForm(res, service) {

    fs.readFile(path.resolve(__dirname, 'login.hbs'), 'utf-8', function (error, source) {
        if (error) {
            res.status(500).send(error);
        }

        let template = handlebars.compile(source);
        res.send(template({service: service}));
    });
}



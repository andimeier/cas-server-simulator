'use strict';
var url = require('url');
var randomstring = require('randomstring');
var _ = require('lodash');
var handlebars = require('handlebars');
var fs = require('fs');
var path = require('path');
var request = require('request');

var config = rootRequire('config/config');

var xml = rootRequire('utils/xml');
var tickets = rootRequire('utils/serviceTickets');

/**
 * list of services for logout (SLO).
 * Each entry consists of:
 *   serviceName: [ list_of_service_tickets ]
 */
var services = {};

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
 * logout
 *
 * @param req
 * @param res
 */
exports.logout = function (req, res) {

    logger.verbose('logging out ...');

    _.forEach(services, function (tickets, service) {
        tickets.forEach(function (ticket) {
            sendServiceLogout(service, ticket);
        });

    });

    // now forget about the services
    services = {};

    renderLoggedOutPage(res);
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
    var service;

    if (!req.query.service) {
        res.status(400).send('missing parameter "service"');
        return;
    }

    if (!req.query.username) {
        res.status(400).send('missing form parameter "username"');
        return;
    }

    logger.verbose('logging in ...');

    // generate service ticket
    service = req.query.service;
    ticket = tickets.generateServiceTicket(service, req.query.username).ticket;

    // register service ticket for later use on SLO (single logout)
    if (!services[service]) {
        services[service] = [];
    }
    services[service].push(ticket);


    // redirect with added ticket as query parameter
    logger.silly('ticket [' + ticket + '] generated, doing redirect to [' + req.query.service + '] ...');
    let serviceUrl = url.parse(req.query.service, true);
    serviceUrl.search = undefined; // make sure query object is used for format()
    serviceUrl.query.ticket = ticket;
    logger.silly('  --> redirect to ' + serviceUrl.format());
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


/**
 * renders the "logged out" page
 *
 * @param res
 */
function renderLoggedOutPage(res) {

    fs.readFile(path.resolve(__dirname, 'logout.hbs'), 'utf-8', function (error, source) {
        if (error) {
            res.status(500).send(error);
        }

        let template = handlebars.compile(source);
        res.send(template());
    });
}


/**
 * sends a logout XML document via POST to the given service
 *
 * @param service {string} URL of the service. To this URL the logout XML document will be posted
 * @param ticket {string} the service ticket to be invalidated
 * @param logoutXml (string) logout XML document
 */
function sendServiceLogout(service, ticket) {

    logger.verbose('--> sending logout instruction to service ' + service);
    logger.silly('    (ticket: ' + ticket);

    // fire and forget, do not process response status
    request.post({
        url: service,
        body: buildLogoutXml(ticket),
        headers: {
            'Content-Type': 'text/xml'
        }
    });
}


/**
 * builds the XML document used for single logout
 *
 * @param ticket {string} the service ticket (which will be included in the message)
 * @returns {string} the XML string which is the payload of a logout POST request to the services in case of SLO
 */
function buildLogoutXml(serviceTicket) {

    return '<samlp:LogoutRequest xmlns:samlp="urn:oasis:names:tc:SAML:2.0:protocol"' +
        ' ID="[RANDOM ID]" Version="2.0" IssueInstant="' + Date.now() + '">' +
        ' <saml:NameID xmlns:saml="urn:oasis:names:tc:SAML:2.0:assertion">' +
        ' @NOT_USED@' +
        ' </saml:NameID>' +
        ' <samlp:SessionIndex>' + serviceTicket + '</samlp:SessionIndex>' +
        ' </samlp:LogoutRequest>';
}

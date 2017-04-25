'use strict';
var url = require('url');
var randomstring = require('randomstring');
var config = rootRequire('config/config');
var xml = rootRequire('utils/xml');
var user = rootRequire('utils/user');
var _ = require('lodash');
var handlebars = require('handlebars');
var fs = require('fs');
var path = require('path');

var tickets = [];

var EXPIRY_TIME = 60 * config.serviceTicketExpiry;


/**
 * simulate positive CAS login
 *
 * @param req
 * @param res
 */
exports.login = function (req, res) {
    logger.verbose('in login ...');
    var service;
    var ticket;

    if (!req.query.service) {
        res.status(400).send('missing parameter "service"');
        return;
    }

    service = url.parse(req.query.service, true);

    renderLoginForm(req.query.service, function (err, html) {
        if (err) {
            res.status(500).send(err);
        }

        res.send(html);
    });
    return;


    // generate service ticket
    ticket = generateServiceTicket(req.query.service).ticket;

    service.query.ticket = ticket;
    res.redirect(service.format());
};


/**
 * process submitted login data
 *
 * @param req
 * @param res
 */
exports.loginForm = function (req, res) {
    logger.verbose('in loginForm ...');
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

    user.setUser(req.query.username);

    service = url.parse(req.query.service, true);

    // generate service ticket
    ticket = generateServiceTicket(req.query.service).ticket;

    service.query.ticket = ticket;
    res.redirect(service.format());
};


/**
 * lists all current service tickets
 *
 * @param req
 * @param res
 */
exports.getTickets = function (req, res) {
    logger.verbose('in getTickets ...');
    var allTickets;

    allTickets = _.map(tickets, function (ticket) {
        return ticket.ticket + '|' + ticket.service + '|' + ticket.validUntil;
    }).join('\n');
    res.send(allTickets);
};


/**
 * validates a service ticket
 *
 * @param req
 * @param res
 */
exports.validate = function (req, res) {
    var ticket;
    var foundTicket;
    var userId;

    logger.verbose('in /validate ...');

    ticket = req.query.ticket;

    res.set('Content-Type', 'text/xml');

    if (!ticket) {
        res.status(400).send('missing parameter "ticket"');
        return;
    }

    if (ticket.substr(0, 3) !== 'ST-') {
        res.send(xml.fail('INVALID_TICKET_SPEC', ticket));
        return;
    }

    foundTicket = _.remove(tickets, (t) => t.ticket === ticket);

    if (foundTicket.length) {
        userId = user.getUser();
        logger.verbose('ticket ' + ticket + ' has been approved successfully, sending OK response with user [' + userId + ']');
        // found ticket, valid!
        res.send(xml.success(userId));
    } else {
        logger.verbose('ticket ' + ticket + ' has been rejected, sending NOK response');
        res.send(xml.fail('INVALID_TICKET', ticket));
    }
};

/**
 * remove all expired tickets
 */
exports.removeExpiredTickets = function () {
    var now;
    var removed;

    logger.verbose('run "remove obsolete tickets"');

    now = new Date().getTime();

    removed = _.remove(tickets, function (ticket) {
        return ticket.validUntil < now;
    });

    if (removed.length) {
        logger.verbose(removed.length + ' ticket(s) removed');
    }
};


/**
 * generates a service ticket for the specified service and remembers it
 *
 * @param service {string} the service for which the service ticket should be generated
 * @return {object} the generated service ticket
 */
function generateServiceTicket(service) {
    var ticket;
    var ticketObject;

    ticket = 'ST-' + randomstring.generate(20);

    ticketObject = {
        ticket: ticket,
        service: service,
        validUntil: new Date().getTime() + EXPIRY_TIME * 1000
    };
    tickets.push(ticketObject);

    return ticketObject;
}


/**
 * renders the login form
 *
 * @param service {string} the requesting service
 * @param callback {function} the callback function which will be called with (err, htmlOutput)
 */
function renderLoginForm(service, callback) {
    var loginFormTemplate = rootRequire('routes/login/login.hbs');
    var template;

    fs.readFile(path.resolve(__dirname, 'login/login.hbs'), 'utf-8', function (error, source) {
        var template;

        if (error) {
            callback(error);

        }

        debugger;
        template = handlebars.compile(source);
        callback(null, template({service: service}));
    });
}
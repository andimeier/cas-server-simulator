'use strict';
var url = require('url');
var randomstring = require('randomstring');
var config = rootRequire('config/config');
var xml = rootRequire('utils/xml');
var _ = require('lodash');

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
    var ticket;
    var service;

    if (!req.query.service) {
        res.status(400).send('missing parameter "service"');
        return;
    }

    service = url.parse(req.query.service, true);

    // add service ticket
    ticket = 'ST-' + randomstring.generate(20);
    service.query.ticket = ticket;

    tickets.push({
        ticket: ticket,
        service: req.query.service,
        validUntil: new Date().getTime() + EXPIRY_TIME * 1000
    });

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
        // found ticket, valid!
        res.send(xml.success(config.cas.userId));
    } else {
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
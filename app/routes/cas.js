'use strict';
var url = require('url');
var randomstring = require('randomstring');
var config = rootRequire('config/config');
var xml = rootRequire('utils/xml');
var _ = require('lodash');

var tickets = [];

var EXPIRY_TIME = 5 * 60; // service ticket expires after 5 minutes

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
        validUntil: new Date().getTime() + EXPIRY_TIME * 1000
    });

    res.redirect(service.format());
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
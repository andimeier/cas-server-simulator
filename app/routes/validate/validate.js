'use strict';

var config = rootRequire('config/config');

var xml = rootRequire('utils/xml');
var tickets = rootRequire('utils/serviceTickets');



/**
 * validates a service ticket
 *
 * @param req
 * @param res
 */
exports.validate = function (req, res) {
    var ticket;
    var service;
    var foundTicket;
    var userId;

    logger.verbose('in /validate ...');

    ticket = req.query.ticket;
    service = req.query.service;

    res.set('Content-Type', 'text/xml');

    if (!ticket) {
        res.status(400).send('missing parameter "ticket"');
        return;
    }

    if (ticket.substr(0, 3) !== 'ST-') {
        res.send(xml.fail('INVALID_TICKET_SPEC', ticket));
        return;
    }

    if (!service) {
        res.status(400).send('missing parameter "service"');
        return;
    }

    tickets.pullTicket(ticket, service, (error, foundTicket) => {
        if (error) {
            logger.verbose(`${error.code}: ${error.message}`);
            res.send(xml.fail(error.code, error.message, ticket));
        } else {
            // success
            userId = foundTicket.userId;
            logger.verbose(`ticket ${ticket} has been approved successfully, sending OK response with user [${userId}]`);
            // found ticket, valid!
            res.send(xml.success(userId));
        }
    });
};


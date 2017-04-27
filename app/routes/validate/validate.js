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

    foundTicket = tickets.pullTicket(ticket);

    if (foundTicket) {
        userId = foundTicket.userId;
        logger.verbose('ticket ' + ticket + ' has been approved successfully, sending OK response with user [' + userId + ']');
        // found ticket, valid!
        res.send(xml.success(userId));
    } else {
        logger.verbose('ticket ' + ticket + ' has been rejected, sending NOK response');
        res.send(xml.fail('INVALID_TICKET', ticket));
    }
};


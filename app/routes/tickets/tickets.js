'use strict';
var _ = require('lodash');

var tickets = rootRequire('utils/serviceTickets');


/**
 * lists all current service tickets
 *
 * @param req
 * @param res
 */
exports.getTickets = function (req, res) {
    logger.verbose('in getTickets ...');
    var allTickets;

    allTickets = _.map(tickets.getAllTickets(), function (ticket) {
        return ticket.ticket + '|' + ticket.service + '|' + ticket.validUntil;
    }).join('\n');
    res.send(allTickets);
};

'use strict';
var _ = require('lodash');
var randomstring = require('randomstring');

var config = rootRequire('config/config');

var tickets = [];

var EXPIRY_TIME = 60 * config.serviceTicketExpiry;

/**
 * generates a service ticket for the specified service and remembers it
 *
 * @param service {string} the service for which the service ticket should be generated
 * @param userId {string} the username associated with the service ticket
 * @return {object} the generated service ticket
 */
function generateServiceTicket(service, userId) {
    var ticket;
    var ticketObject;

    ticket = 'ST-' + randomstring.generate(20);

    ticketObject = {
        ticket: ticket,
        service: service,
        userId: userId,
        validUntil: new Date().getTime() + EXPIRY_TIME * 1000
    };
    tickets.push(ticketObject);

    return ticketObject;
}


/**
 * return all existing service tickets
 *
 * @returns {Array} list of ticket objects
 */
function getAllTickets() {
    return tickets;
}


/**
 * remove all expired tickets
 */
function removeExpiredTickets() {
    var now;
    var removed;

    logger.silly('run "remove obsolete tickets"');

    now = new Date().getTime();

    removed = _.remove(tickets, function (ticket) {
        return ticket.validUntil < now;
    });

    if (removed.length) {
        logger.verbose(removed.length + ' ticket(s) removed');
        removed.forEach(function (removedTicket) {
            logger.silly('removed ticket: ' + removedTicket.ticket);
        });
    }
}


/**
 * returns the specified ticket, and at the same time remove it from the list of tickets
 *
 * @param ticketId {string} ticket ID
 * @returns {object} ticket object or undefined if not found (or it already has expired)
 */
function pullTicket(ticketId) {
    let foundTicket = _.remove(tickets, (t) => t.ticket === ticketId)[0];

    // check if not expired
    if (foundTicket && foundTicket.validUntil < new Date().getTime()) {
        // ticket has expired
        foundTicket = undefined;
    }

    return foundTicket;
}


module.exports = {
    generateServiceTicket,
    getAllTickets,
    removeExpiredTickets,
    pullTicket
};
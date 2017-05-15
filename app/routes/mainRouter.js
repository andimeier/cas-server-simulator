'use strict';
var router = require('express').Router({ mergeParams: true });

var config = rootRequire('config/config');

var validate = routeRequire('validate/validate');
var tickets = routeRequire('tickets/tickets');
var login = routeRequire('login/login');
var version = routeRequire('version/version');

// --- routes ---
router.get('/version', version.getVersion);

router.get('/tickets', tickets.getTickets);

router.get('/login', login.login);
router.get('/loginForm', login.submitLoginForm);
router.post('/login', login.submitLoginForm);
router.get('/logout', login.logout);

router.get('/serviceValidate', validate.validate);

//router.get('/getUser', user.getUser);
//router.get('/setUser', user.setUser);

//router.get('/tickets/:which', cas.acceptTickets);

router.use(function (req, res) {
    logger.verbose('Unrecognized route: ', {url: req.originalUrl}, JSON.stringify(new Error().stack, null, 2));
    res.sendStatus(404);
});


module.exports = router;

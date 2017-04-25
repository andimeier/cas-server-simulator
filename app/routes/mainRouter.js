'use strict';
var router = require('express').Router({ mergeParams: true });
var version = require('./version/version');

var config = rootRequire('config/config');

var cas = require('./cas');

// --- routes ---
router.get('/version', version.getVersion);
router.get('/tickets', cas.getTickets);

router.get('/login', cas.login);
router.get('/loginForm', cas.loginForm);
router.post('/login', cas.loginForm);
router.get('/serviceValidate', cas.validate);

//router.get('/getUser', user.getUser);
//router.get('/setUser', user.setUser);

//router.get('/tickets/:which', cas.acceptTickets);

router.use(function (req, res) {
    logger.verbose('Unrecognized route: ', {url: req.originalUrl}, JSON.stringify(new Error().stack, null, 2));
    res.sendStatus(404);
});


module.exports = router;

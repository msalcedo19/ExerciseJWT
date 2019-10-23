var express = require('express');
var router = express.Router();

var HandlerGenerator = require("../handlegenerator.js");
var middleware = require("../middleware.js");

HandlerGenerator1 = new HandlerGenerator();

/* GET home page. */
router.get('/:username', middleware.checkToken, HandlerGenerator1.get_info);

router.post( '/login', HandlerGenerator1.login);
router.post( '/register', HandlerGenerator1.register);
router.put( '/modify', middleware.checkToken, HandlerGenerator1.modify);

module.exports = router;

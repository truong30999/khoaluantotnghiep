const express = require('express');
const router = express.Router();
const auth = require('../controller/auth.controller.js')
const statistical = require("../controller/statsistical.controller")


router.get('/:Year', auth.validJWTNeeded, statistical.getByYear)

module.exports = router;

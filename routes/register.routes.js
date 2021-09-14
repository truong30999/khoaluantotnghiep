const express = require('express');
const router = express.Router();
const User = require('../controller/user.controller')

router.post('/',User.register )

module.exports = router;
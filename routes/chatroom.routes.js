const express = require('express')
const router = express.Router()
const Roomchat = require("../controller/roomchat.controller")

router.post('/', Roomchat.createRoomChat)
router.get('/:Id', Roomchat.getRoomchat)


module.exports = router
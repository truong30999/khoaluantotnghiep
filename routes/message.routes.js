const express = require('express')
const router = express.Router()
const Message = require("../controller/message.controller")

router.post('/', Message.CreateMessage)
router.get('/:roomchatId', Message.getMessageOfRoomchat)


module.exports = router
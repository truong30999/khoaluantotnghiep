const express = require('express')
const router = express.Router()
const Message = require("../controller/message.controller")

router.post('/', Message.CreateMessage)
router.get('/:roomchatId', Message.getMessageOfRoomchat)
router.get('/Id/:messageId', Message.getMessage)

module.exports = router
const express = require('express')
const router = express.Router()
const Room = require('../controller/room.controller')
const auth = require('../controller/auth.controller')
const fileUpload = require('../middleware/file-upload.js')


router.get('/', Room.getAllRoom)
router.get('/emptyRoom',auth.validJWTNeeded, Room.getEmptyRoom)
router.get('/notemptyRoom', auth.validJWTNeeded, Room.getNotEmptyRoom)

router.get('/:roomId', Room.getRoomById)

router.get('/house/:houseId',Room.getRoomByHouse)

router.get('/person/:roomId', Room.getPersonInRoom)

router.get('/service/:roomId', Room.getServideOfRoom)

router.post('/',auth.validJWTNeeded,fileUpload.array('Image'), Room.createRoom)

router.patch('/:roomId/addService/:serviceId',Room.addServiceToRoom)

router.patch('/:roomId/removeService/:serviceId',Room.removeServiceToRoom)

router.patch('/:roomId/addCustomer/:customerId', Room.addPersonToRoom)

router.patch('/:roomId/removeCustomer/:customerId', Room.removePersonToRoom)

router.patch('/:roomId',fileUpload.single('Image'), Room.updateRoom)

router.delete('/:roomId', Room.deleteRoom)

module.exports = router
const express =  require('express')
const router = express.Router()
const House = require('../controller/house.controller')
const auth = require('../controller/auth.controller')
router.post('/',House.createHouse)
router.get('/',auth.validJWTNeeded,House.getAllHouseOfUser)
router.get('/:houseId',House.getHouseById)
router.patch('/:houseId',House.updateHouse)
router.delete('/:houseId',House.deleteHouse)


module.exports = router
const express = require('express')
const router = express.Router()
const Service = require('../controller/services.controller')
const auth = require('../controller/auth.controller.js')

router.post('/', Service.createService)
router.patch('/:serviceId', Service.updateService)
router.get('/', Service.getAllService)
router.get('/user',auth.validJWTNeeded, Service.getServiceOfUser)
router.get('/:serviceId', Service.getServiceById)
router.delete('/:serviceId', Service.deleteService)

module.exports = router

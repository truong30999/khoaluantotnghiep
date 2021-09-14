const express = require('express')
const router = express.Router()
const UtilityBill = require('../controller/utilitybills.controller')
const auth =  require('../controller/auth.controller')

router.post('/', UtilityBill.createUtilityBills)
router.patch('/:Id', UtilityBill.update)
router.get('/', auth.validJWTNeeded, UtilityBill.getAllUtilityByRoom)
router.get('/:Id',UtilityBill.getById)
router.delete('/:Id', UtilityBill.delete)

module.exports = router
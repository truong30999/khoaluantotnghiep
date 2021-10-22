const express = require('express')
const router = express.Router()
const UtilityBill = require('../controller/utilitybills.controller')
const auth = require('../controller/auth.controller')

router.post('/', UtilityBill.createUtilityBills)
router.patch('/', auth.validJWTNeeded, UtilityBill.getAllUtilityByRoom)
router.patch('/:Id', UtilityBill.update)
router.get('/:Id', UtilityBill.getById)
router.delete('/:Id', UtilityBill.delete)

module.exports = router
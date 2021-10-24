const express = require('express')
const router = express.Router()
const bill = require('../controller/bill.controller')
const auth = require('../controller/auth.controller')


//router.get('/currentmonth',bill.getBillInMonthOfUser)
router.post('/', bill.createBill)
router.patch('/', auth.validJWTNeeded, bill.getBillInMonthOfUser)
router.patch('/:billId', bill.updateBill)
router.patch('/recalculate/:billId', bill.recalculateBill)
router.delete('/:billId', bill.deleteBill)
router.get('/:billId', bill.getBillById)


module.exports = router
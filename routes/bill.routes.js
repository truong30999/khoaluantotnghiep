const express = require('express')
const router = express.Router()
const bill = require('../controller/bill.controller')


//router.get('/currentmonth',bill.getBillInMonthOfUser)
router.post('/', bill.createBill)
router.patch('/', bill.getBillInMonthOfUser)
router.patch('/:billId', bill.updateBill)
router.patch('/:billId/status', bill.updateStatus)
router.patch('/recalculate/:billId', bill.recalculateBill)
router.delete('/:billId', bill.deleteBill)
router.get('/:billId', bill.getBillById)


module.exports = router
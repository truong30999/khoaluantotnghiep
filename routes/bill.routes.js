const express =  require('express')
const router = express.Router()
const bill = require('../controller/bill.controller')

router.get('/',bill.getBillInMonthOfUser )
//router.get('/currentmonth',bill.getBillInMonthOfUser)
router.post('/',bill.createBill)
router.patch('/:billId', bill.updateBill)
router.delete('/:billId', bill.deleteBill)
router.get('/:billId', bill.getBillById)


module.exports = router
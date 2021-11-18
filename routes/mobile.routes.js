const express = require('express')
const router = express.Router()
const customer = require('../controller/customer.controller')
// const fileUpload = require('../middleware/file-upload.js')
const auth = require("../controller/auth.controller")

router.get('/contract', auth.validJWTNeeded, customer.getContract)
router.patch('/contract/confirm', customer.confirmContract)

router.get('/bill', auth.validJWTNeeded, customer.getListBillCustomer)
router.get('/bill/:billId', customer.getInfoBill)

router.post('/login', customer.isPasswordAndPhoneMatch, customer.login)
//router.patch('/:customerId', auth.validJWTNeeded, fileUpload.array('Image'), customer.updateCustomer)
router.patch('/changePassword', auth.validJWTNeeded, customer.changePassword)

module.exports = router
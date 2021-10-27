const express = require('express')
const router = express.Router()
const customer = require('../controller/customer.controller')
const fileUpload = require('../middleware/file-upload.js')
const auth = require("../controller/auth.controller")


router.get('/', auth.validJWTNeeded, customer.getAllCustomerOfUser)
router.post('/', auth.validJWTNeeded, fileUpload.array('Image'), customer.createCustomer)
router.post('/login', customer.isPasswordAndPhoneMatch, customer.login)

router.get('/:customerId', customer.getCustomerById)
router.patch('/:customerId', auth.validJWTNeeded, fileUpload.array('Image'), customer.updateCustomer)
router.delete('/:customerId', customer.deleteCustomer)
module.exports = router
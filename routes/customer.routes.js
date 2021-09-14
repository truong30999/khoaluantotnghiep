const express =  require('express')
const router = express.Router()
const customer = require('../controller/customer.controller')
const fileUpload = require('../middleware/file-upload.js')
const auth = require("../controller/auth.controller")


router.get('/',auth.validJWTNeeded, customer.getAllCustomerOfUser)
router.post('/',auth.validJWTNeeded,fileUpload.single('Image'), customer.createCustomer)
router.get('/:customerId', customer.getCustomerById)
router.patch('/:customerId',fileUpload.single('Image'), customer.updateCustomer)
router.delete('/:customerId', customer.deleteCustomer)
module.exports = router
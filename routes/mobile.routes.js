const express = require('express')
const router = express.Router()
const customer = require('../controller/customer.controller')
// const fileUpload = require('../middleware/file-upload.js')
const auth = require("../controller/auth.controller")

router.get('/contract', auth.validJWTNeeded, customer.getContract)
router.get('/rating', auth.validJWTNeeded, customer.getRating)
router.get('/top-rating-house', customer.getHouseTopRating)
router.get('/room-relate-post', customer.getRoomRelatePost)
router.patch('/contract/confirm', customer.confirmContract)
router.patch('/device-token', auth.validJWTNeeded, customer.updateDeviceInfo)

router.get('/user/:userId', customer.getUserById)
router.get('/message/:roomchatId', customer.getMessageOfRoomchat)
router.post('/message', customer.CreateMessage)

router.get('/bill', auth.validJWTNeeded, customer.getListBillCustomer)
router.get('/bill/:billId', customer.getInfoBill)
router.get('/house', customer.searchHouse)
router.get('/house/:houseId', customer.getRoomByHouse)
router.post('/login', customer.isPasswordAndPhoneMatch, customer.login)
router.post('/rating', auth.validJWTNeeded, customer.rating)
//router.patch('/:customerId', auth.validJWTNeeded, fileUpload.array('Image'), customer.updateCustomer)
router.patch('/changePassword', auth.validJWTNeeded, customer.changePassword)

module.exports = router
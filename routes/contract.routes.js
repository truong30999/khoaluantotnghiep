const express = require('express')
const router = express.Router()
const contract = require('../controller/contract.controller')

router.get('/', contract.getContractOfUser)
router.post('/', contract.createContract)
router.patch('/:contractId', contract.editStatus)
router.delete('/:contractId', contract.deleteContract)
router.get('/:contractId', contract.detailContract)


module.exports = router
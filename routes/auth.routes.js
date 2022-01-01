const express = require('express')
const router = express.Router()
const Auth = require('../controller/auth.controller')
const jwt = require("jsonwebtoken")
const config = require("../config/config")
router.post('/', Auth.hasAuthValidFields, Auth.isPasswordAndUserMatch, Auth.login)
router.post('/google', Auth.loginGoogle)

router.post('/tokenIsValid', async (req, res) => {
    try {
        const token = req.headers["authorization"].split(' ')
        if (!token) return res.json(false)
        const verify = jwt.verify(token[1], config.jwtSecret)
        if (!verify) return res.json(false)

        return res.json(true)
    } catch (err) {
        res.status(500).json({ error: err.message })
    }

})


module.exports = router
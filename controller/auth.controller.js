const User = require('../models/User.model')
const jwt = require('jsonwebtoken')
const config = require('../config/config')
const crypto = require('crypto');

exports.isPasswordAndUserMatch = (req, res, next) => {
    User.findOne({ Email: req.body.Email })
        .then((user) => {
            if (!user || user.Status === 0) {
                res.status(404).send({ errors: "User not found" });
            } else {
                let passwordFields = user.PassWord.split('$');
                let salt = passwordFields[0];
                let hash = crypto.createHmac('sha512', salt).update(String(req.body.PassWord)).digest("base64");
                if (hash === passwordFields[1]) {
                    req.body = {
                        userId: user._id,
                        email: user.Email,
                        permissionLevel: user.Type,


                    };
                    return next();
                } else {
                    return res.status(400).send({ errors: ['Invalid email or password'] });
                }
            }
        });
};
exports.login = (req, res) => {
    try {
        let refreshId = req.body.userId + config.jwtSecret;
        let salt = crypto.randomBytes(16).toString('base64');
        let hash = crypto.createHmac('sha512', salt).update(refreshId).digest("base64");
        req.body.refreshKey = salt;
        let token = jwt.sign(req.body, config.jwtSecret, { expiresIn: '1h' });
        let b = new Buffer(hash);
        let refresh_token = b.toString('base64');
        res.json({ userId: req.body.userId, Email: req.body.email, accessToken: token, refreshToken: refresh_token });
    } catch (err) {
        res.status(500).send({ errors: err });
    }
};

exports.hasAuthValidFields = (req, res, next) => {
    let errors = [];

    if (req.body) {
        if (!req.body.Email) {
            errors.push('Missing email field');
        }
        if (!req.body.PassWord) {
            errors.push('Missing password field');
        }

        if (errors.length) {
            return res.status(400).send({ errors: errors.join(',') });
        } else {
            return next();
        }
    } else {
        return res.status(400).send({ errors: 'Missing email and password fields' });
    }
};
exports.validJWTNeeded = (req, res, next) => {
    if (req.headers['authorization']) {
        try {
            let authorization = req.headers.authorization.split(' ');
            if (authorization[0] !== 'Bearer') {
                return res.status(401).send({ errors: "no header 1" });
            } else {
                req.jwt = jwt.verify(authorization[1], config.jwtSecret);
                return next();
            }
        } catch (err) {
            return res.status(403).send({ errors: "no header 2" });
        }
    } else {
        return res.status(401).send({ errors: "no header 3" });
    }
};

exports.minimumPermissionLevelRequired = (required_permission_level) => {
    return (req, res, next) => {
        let user_permission_level = parseInt(req.jwt.permissionLevel);
        let user_id = req.jwt.userId;
        if (user_permission_level & required_permission_level) {
            return next();
        } else {
            return res.status(403).send({ errors: "cannot access" });
        }
    };
};

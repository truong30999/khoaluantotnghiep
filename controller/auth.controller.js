const User = require('../models/User.model')
const jwt = require('jsonwebtoken')
const config = require('../config/config')
const crypto = require('crypto');
const { OAuth2Client } = require('google-auth-library');
const Service = require("../models/Services.model");

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
exports.loginGoogle = async (req, res) => {
    const client = new OAuth2Client(
        config.GOOGLE_CLIENT_ID,
        config.GOOGLE_CLIENT_SECRET
    );
    try {
        const { clientId } = req.body
        const verified = await client.verifyIdToken({ idToken: clientId, audience: config.GOOGLE_CLIENT_ID })
        const { email_verified, email, name, picture } = verified.payload
        if (email_verified) {
            const exist_user = await User.findOne({ Email: email })
            if (exist_user) {
                let refreshId = exist_user._id + config.jwtSecret;
                let salt = crypto.randomBytes(16).toString('base64');
                let hash = crypto.createHmac('sha512', salt).update(refreshId).digest("base64");
                const refreshKey = salt;
                const payload = {
                    userId: exist_user._id,
                    email: exist_user.Email,
                }
                let token = jwt.sign(payload, config.jwtSecret, { expiresIn: '1h' });
                let b = new Buffer(hash);
                let refresh_token = b.toString('base64');
                res.json({ userId: exist_user._id, Email: exist_user.Email, accessToken: token, refreshToken: refresh_token });
            } else {
                try {
                    console.log("chưa tạo tk")
                    let salt = crypto.randomBytes(16).toString("base64");
                    let hash = crypto
                        .createHmac("sha512", salt)
                        .update("123456")
                        .digest("base64");
                    const PassWord = salt + "$" + hash;
                    const new_user = new User({
                        Name: name,
                        Email: email,
                        PassWord: PassWord,
                        Type: 1,
                        Status: 1,
                    });
                    await new_user.save()
                    this.initService(new_user._id)
                    const payload = {
                        userId: new_user._id,
                        email: new_user.Email,
                    }
                    const rhash = crypto.createHmac('sha512', salt).update((new_user._id + config.jwtSecret)).digest("base64");
                    let token = jwt.sign(payload, config.jwtSecret, { expiresIn: '1h' });
                    let b = new Buffer(rhash);
                    let refresh_token = b.toString('base64');
                    res.json({ userId: new_user._id, Email: new_user.Email, accessToken: token, refreshToken: refresh_token });
                } catch (error) {
                    console.log(error)
                }

            }
        } else {
            res.json({ error: "Your email is not verified!" })
        }
    } catch (err) {
        res.json({ error: err });
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
exports.initService = async (userId) => {
    const service1 = new Service({
        ServiceName: "Điện",
        Description: "Tiền điện",
        Price: 3000,
        UserId: userId,
    });
    const service2 = new Service({
        ServiceName: "Nước",
        Description: "Tiền Nước",
        Price: 10000,
        UserId: userId,
    });
    const service3 = new Service({
        ServiceName: "Rác",
        Description: "Tiền rác hàng tháng",
        Price: 3000,
        UserId: userId,
    });
    await service1.save();
    await service2.save();
    await service3.save();
};
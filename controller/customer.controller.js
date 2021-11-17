const Customer = require('../models/Customer.model')
const Room = require('../models/Room.model')
const common = require('../utility/common')
const jwt = require('jsonwebtoken')
const fs = require('fs');
const crypto = require("crypto");
const Nexmo = require('nexmo');
const config = require("../config/config")
const nexmo = new Nexmo({
    apiKey: config.NEXMO_API_KEY,
    apiSecret: config.NEXMO_API_SECRET,
}, { debug: true });
exports.createCustomer = async (req, res, next) => {
    const customer = await Customer.findOne({ Phone: req.body.Phone })
    if (customer) {
        return res.json({ error: "Phone already used!" });
    }
    let imgArr = common.convertArrImage(req.files)
    try {
        let salt = crypto.randomBytes(16).toString("base64");
        let hash = crypto
            .createHmac("sha512", salt)
            .update("123456")
            .digest("base64");
        const password = salt + "$" + hash;
        const customer = new Customer({
            Name: req.body.Name,
            Age: req.body.Age,
            DateOfBirth: req.body.DateOfBirth,
            Phone: req.body.Phone,
            Password: password,
            Email: req.body.Email,
            PermanentAddress: req.body.PermanentAddress,
            Cmnd: req.body.Cmnd,
            DateCmnd: req.body.DateCmnd,
            PlaceCmnd: req.body.PlaceCmnd,
            Image: imgArr,
            UserId: req.jwt.userId,
            RoomId: req.body.RoomId
        })
        const room = await Room.findById(req.body.RoomId)
        if (room.ListPerson.length === 0) {
            room.Status = 1
        }
        room.ListPerson.push(customer._id)
        await room.save()
        let result = await customer.save()


        res.json(result)

    } catch (err) {
        res.json({ message: err.message })
    }

}

exports.getAllCustomerOfUser = async (req, res) => {
    try {
        const list = await Customer.find({ UserId: req.jwt.userId }).populate({
            path: 'RoomId',
            select: 'RoomNumber',
            populate: { path: 'HouseId', select: "Name" }
        })

        res.json(list);
    } catch (err) {
        res.json({ message: err });
    }

}
exports.getCustomerById = async (req, res) => {
    try {
        const customer = await Customer.findById(req.params.customerId).populate({
            path: 'RoomId',
            select: 'RoomNumber',
            populate: { path: 'HouseId', select: "Name" }
        })
        res.json(customer);
    } catch (err) {
        res.json({ message: err.message });
    }
}
exports.updateCustomer = async (req, res) => {

    const customer = await Customer.findById(req.params.customerId)
    let newCustomer = req.body
    if (req.files && req.files.length) {
        let imgArr = common.convertArrImage(req.files)
        newCustomer.Image = imgArr
        if (customer.Image && customer.Image.length) {
            customer.Image.map((img) => {
                fs.unlink(img, err => {
                    console.log(err.message);
                });
            })
        }
    }
    try {

        const updatedCustomer = await Customer.updateOne(
            { _id: req.params.customerId },
            { $set: newCustomer }

        );
        res.json(updatedCustomer);
    } catch (err) {
        res.json({ message: err.message });
    }

}
exports.deleteCustomer = async (req, res) => {
    const customer = await Customer.findById(req.params.customerId)
    const room = await Room.findById(customer.RoomId)
    const pos = room.ListPerson.indexOf(req.params.customerId)
    room.ListPerson.splice(pos, 1)
    if (room.ListPerson.length === 0) {
        room.Status = 0
    }
    await room.save()
    if (customer.Image.length > 0) {
        customer.Image.forEach(image => {
            fs.unlink(image, err => {
                console.log(err);
            });
        });
    }
    try {
        const removeCustomer = await Customer.remove({ _id: req.params.customerId })
        res.json(removeCustomer)

    } catch (err) {
        res.json({ message: err })
    }
}
exports.isPasswordAndPhoneMatch = (req, res, next) => {
    // if (req.body.Phone.length !== 10) {
    //     return res.json({ error: "Vui lòng nhập đúng số điện thoại!" })
    // }

    Customer.findOne({ Phone: req.body.Phone })
        .then((customer) => {
            if (!customer) {
                res.json({ error: "Phone not found" });
            } else {
                let passwordFields = customer.Password.split('$');
                let salt = passwordFields[0];
                let hash = crypto.createHmac('sha512', salt).update(String(req.body.Password)).digest("base64");
                if (hash === passwordFields[1]) {
                    req.body = {
                        customerId: customer._id,
                    };
                    return next();
                } else {
                    return res.json({ error: 'Invalid Password' });
                }
            }
        });
};
exports.login = (req, res) => {
    try {
        let token = jwt.sign(req.body, config.jwtSecret, { expiresIn: '15m' });
        res.json({ customerId: req.body.customerId, accessToken: token });
    } catch (err) {
        res.status(500).send(err);
    }
};



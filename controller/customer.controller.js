const Customer = require('../models/Customer.model')
const Room = require('../models/Room.model')
const Bill = require('../models/Bill.model')
const Contract = require('../models/Contract.model')
const House = require('../models/House.model')
const User = require('../models/User.model')
const Message = require('../models/Message.model')
const Roomchat = require('../models/Roomchat.model')

const common = require('../utility/common')
const jwt = require('jsonwebtoken')
const fs = require('fs');
const crypto = require("crypto");
const config = require("../config/config")
const AWS = require('aws-sdk');
var mongoose = require('mongoose');
const { response } = require('express')


exports.createCustomer = async (req, res, next) => {
    const customer = await Customer.findOne({ Phone: req.body.Phone })
    if (customer) {
        return res.json({ error: "Phone already used!" });
    }
    let imgArr = common.convertArrImage(req.files)

    try {
        let salt = crypto.randomBytes(16).toString("base64");
        let password = "123456"
        let hash = crypto
            .createHmac("sha512", salt)
            .update(password)
            .digest("base64");
        const passwordHash = salt + "$" + hash;
        const customer = new Customer({
            Name: req.body.Name,
            Age: req.body.Age,
            DateOfBirth: req.body.DateOfBirth,
            Phone: req.body.Phone,
            Password: passwordHash,
            Email: req.body.Email,
            PermanentAddress: req.body.PermanentAddress,
            Cmnd: req.body.Cmnd,
            DateCmnd: req.body.DateCmnd,
            PlaceCmnd: req.body.PlaceCmnd,
            Image: imgArr,
            UserId: req.jwt.userId,
            RoomId: req.body.RoomId,
            ListRating: [],
            DeviceToken: null
        })

        const room = await Room.findById(req.body.RoomId).populate({
            path: 'HouseId',
            select: "Name",
            populate: { path: 'UserId', select: "Name" }
        })
        if (room.ListPerson.length === 0) {
            room.Status = 1
        }
        room.ListPerson.push(customer._id)
        await room.save()
        let result = await customer.save()
        let phone = '+84' + customer.Phone.substring(1)
        const params = {
            Message: 'Your password of app is: 123456',
            PhoneNumber: phone,
            MessageAttributes: {
                'AWS.SNS.SMS.SMSType': {
                    DataType: 'String',
                    StringValue: 'Transactional'
                }
            }
        };

        // Create chat between customer and user
        const chatroom = new Roomchat({
            Members: [String(customer._id), String(room.HouseId.UserId._id)]
        })
        await chatroom.save();

        const publishTextPromise = new AWS.SNS({ apiVersion: '2010-03-31' }).publish(params).promise();
        publishTextPromise.then(
            function (data) {
                console.log("MessageID is " + data.MessageId);
            }).catch(
                function (err) {
                    console.error(err, err.stack);
                });
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
    const room = await Room.findById(customer.RoomId).populate({
        path: 'HouseId',
        select: "Name",
        populate: { path: 'UserId', select: "Name" }
    })
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
    const roomchat = await Roomchat.find({ Members: [req.params.customerId, room.HouseId.UserId._id] })
    await Roomchat.remove({ _id: roomchat._id })

    const contracts = await Contract.find({ Renter: customer._id })
    for (const contract of contracts) {
        await Contract.remove({ _id: contract._id })
    }
    try {
        const removeCustomer = await Customer.remove({ _id: req.params.customerId })
        res.json(removeCustomer)

    } catch (err) {
        res.json({ message: err })
    }
}
exports.isPasswordAndPhoneMatch = (req, res, next) => {
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
                        customerInfo: customer,
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
        res.json({ customerId: req.body.customerId, customerInfo: req.body.customerInfo, accessToken: token });
    } catch (err) {
        res.status(500).send(err);
    }
};
exports.getListBillCustomer = async (req, res) => {
    try {
        const customer = await Customer.findById(req.jwt.customerId)
        const listBill = await Bill.find({ RoomId: customer.RoomId }, 'EndDate RoomNumber TotalBill Status').sort({ EndDate: 'desc' })
        res.json(listBill)
    } catch (error) {
        res.json(error)
    }
}
exports.getInfoBill = async (req, res) => {
    try {
        const bill = await Bill.findById(req.params.billId)
        res.json(bill)
    } catch (err) {
        res.json({ error: err })
    }
}
exports.getContract = async (req, res) => {
    try {
        const customer = await Customer.findById(req.jwt.customerId)
        const contract = await Contract.find({ Room: customer.RoomId, Status: { $nin: [-1, 0] } })
            .populate("Lessor")
            .populate("Renter")
            .populate("House", "Name Address")
            .populate("Room", "RoomNumber Price")
        res.json(contract)
    } catch (error) {
        res.json({ error: error })
    }
}
exports.confirmContract = async (req, res) => {
    try {
        const result = await Contract.findOneAndUpdate({ _id: req.body.contractId }, { Status: 1 })
        res.json(result)
    } catch (error) {
        res.json({ error: error })
    }
}
exports.changePassword = async (req, res) => {
    try {
        const customer = await Customer.findById(req.jwt.customerId)
        const oldPass = req.body.oldPassword
        const newPass = req.body.newPassword
        let passwordFields = customer.Password.split('$');
        let salt = passwordFields[0];
        let hash = crypto.createHmac('sha512', salt).update(String(oldPass)).digest("base64");
        if (hash === passwordFields[1]) {
            let newsalt = crypto.randomBytes(16).toString("base64");
            let newhash = crypto
                .createHmac("sha512", newsalt)
                .update(newPass)
                .digest("base64");
            const newPassword = newsalt + "$" + newhash;
            customer.Password = newPassword
            await customer.save()
            res.json({ message: "Update password success" })
        } else {
            return res.json({ error: 'Invalid old password' });
        }
    } catch (error) {
        res.json({ error: error })
    }
}
exports.searchHouse = async (req, res) => {
    // req.body.Province, req.body.District
    // req.query.page, req.query.limit
    const page = parseInt(req.query.page)
    const limit = parseInt(req.query.limit)
    const skipIndex = (page - 1) * limit
    const province = new RegExp(`${req.query.province}`, 'i')
    const district = new RegExp(`${req.query.district}`, 'i')
    try {
        const result = await House.find({ Province: province, District: district }, "Name UserId Province District Ward Address TotalRating NumberOfReview Rooms")
            .populate("UserId", "Name Email Phone")
            .limit(limit)
            .skip(skipIndex)
            .exec();
        res.json(result)
    } catch (e) {
        res.json({ error: e })
    }
}
exports.getRoomByHouse = async (req, res) => {
    const houseId = req.params.houseId
    try {
        const listRoom = await Room.find({ HouseId: houseId, Status: { $in: [3] } }, "Price Length Width Details Image RoomNumber")
        res.json(listRoom)
    } catch (error) {
        res.json({ error: error })
    }
}
exports.rating = async (req, res) => {
    // req.body.rating 
    try {
        const rating = Number(req.body.rating)
        const customer = await Customer.findById(req.jwt.customerId).populate("RoomId", "HouseId")
        const house = await House.findById(customer.RoomId.HouseId)
        const houseId = String(customer.RoomId.HouseId)
        let existRating = false
        for (let i = 0; i < customer.ListRating.length; i++) {
            if (customer.ListRating[i].HouseId === houseId) {
                house.TotalRating = (house.TotalRating - customer.ListRating[i].Rating + rating)
                const ojb = { HouseId: houseId, Rating: rating }
                customer.ListRating.splice(i, 1)
                customer.ListRating.push(ojb)
                existRating = true
                await house.save()
                await customer.save()
                res.json(ojb)
                break
            }
        }
        if (!existRating) {
            const ojb = { HouseId: houseId, Rating: rating }
            house.TotalRating = house.TotalRating + rating
            house.NumberOfReview = house.NumberOfReview + 1
            customer.ListRating.push(ojb)
            await house.save()
            await customer.save()
            res.json(ojb)
        }
    } catch (error) {
        res.json({ error: error })
    }
}
exports.getRating = async (req, res) => {
    try {
        const customer = await Customer.findById(req.jwt.customerId).populate("RoomId", "HouseId")
        const house = await House.findById(customer.RoomId.HouseId)
        let existRating = {}
        for (let i = 0; i < customer.ListRating.length; i++) {
            if (customer.ListRating[i].HouseId === String(house._id)) {
                existRating = customer.ListRating[i]
            }
        }
        res.json(existRating)
    } catch (error) {
        res.json({ error: error })
    }
}
exports.getHouseTopRating = async (req, res) => {
    try {
        const house = await House.aggregate([
            {
                $match: {
                    NumberOfReview: { $gt: 0 }
                }
            },
            {
                $lookup: {
                    from: "users",
                    localField: "UserId",
                    foreignField: "_id",
                    as: "UserId"
                }
            },
            {
                $project: {
                    "Name": 1,
                    "Province": 1,
                    "District": 1,
                    "Ward": 1,
                    "Address": 1,
                    "TotalRating": 1,
                    "NumberOfReview": 1,
                    "Rooms": 1,
                    "UserId.Name": 1,
                    "UserId.Email": 1,
                    "UserId.Phone": 1
                }
            }
        ])
            .addFields({ score: { $divide: ["$TotalRating", "$NumberOfReview"] } })
            .sort({ score: 'desc' })
            .limit(8);
        res.json(house)
    } catch (error) {
        res.json({ error: error })
    }
}
exports.getRoomRelatePost = async (req, res) => {
    try {
        const room = await Room.find({ Status: 3 }, "Price Length Width Details Image HouseId TimePost")
            .populate({
                path: 'HouseId',
                select: 'Name Address Province District Ward UserId',
                populate: {
                    path: 'UserId',
                    select: 'Name Phone Email'
                }
            })
            .sort({ TimePost: 'desc' }).limit(14)
        res.json(room)
    } catch (error) {
        res.json({ error: error })
    }
}
exports.updateDeviceInfo = async (req, res) => {
    try {
        const result = await Customer.findOneAndUpdate({ _id: req.jwt.customerId }, { DeviceToken: req.body.DeviceToken })
        res.json(result)
    } catch (error) {
        res.json({ error: error })
    }
}
exports.getUserById = async (req, res) => {
    try {
        const user = await User.findById(req.params.userId);
        res.json(user);
    } catch (err) {
        res.json({ message: err.message });
    }
};
exports.getMessageOfRoomchat = async (req, res) => {
    try {
        let result = []
        const messages = await Message.find({ Roomchat: req.params.roomchatId }).sort({ createdAt: "asc" })
        for (const value of messages) {
            const message = {
                _id: value._id,
                text: value.Text,
                createdAt: value.createdAt,
                user: {
                    _id: "",
                    name: "",
                    avatar: ""
                }
            }
            if (value.Type === "Customer") {
                const a = await Customer.findById(mongoose.Types.ObjectId(value.SenderId))
                message.user._id = a._id
                message.user.name = a.Name
                message.user.avatar = a.Image[0]
            }
            if (value.Type === "User") {
                const a = await User.findById(mongoose.Types.ObjectId(value.SenderId))
                message.user._id = a._id
                message.user.name = a.Name
                message.user.avatar = a.Image
            }
            result.push(message)
        }
        res.json(result)
    } catch (error) {
        res.json(error);
    }
}
exports.CreateMessage = async (req, res) => {
    // req.body.Roomchat , req.body.SenderId, req.body.Text
    req.body.Type = "Customer"
    const newMessage = new Message(req.body)
    try {
        const result = await newMessage.save()
        res.json(result)
    } catch (error) {
        res.json(error);
    }
}
exports.getMessage = async (req, res) => {
    // req.body.Roomchat , req.body.SenderId, req.body.Text
    try {
        Message.findById(req.params.messageId).then(async (value) => {
            const message = {
                _id: value._id,
                text: value.Text,
                createdAt: value.createdAt,
                user: {
                    _id: "",
                    name: "",
                    avatar: ""
                }
            }
            if (value.Type === "Customer") {
                const a = await Customer.findById(mongoose.Types.ObjectId(value.SenderId))
                message.user._id = a._id
                message.user.name = a.Name
                message.user.avatar = a.Image[0]
            }
            if (value.Type === "User") {
                const a = await User.findById(mongoose.Types.ObjectId(value.SenderId))
                message.user._id = a._id
                message.user.name = a.Name
                message.user.avatar = a.Image
            }
            res.json(message)
        })
    } catch (error) {
        res.json(error);
    }
}
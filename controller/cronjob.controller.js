const Customer = require("../models/Customer.model")
const Room = require("../models/Room.model")
const House = require("../models/House.model")
const Roomchat = require('../models/Roomchat.model')
const common = require("../utility/common")
const UtilityBill = require("../models/Utilitybills.model")
const config = require("../config/config")
const AWS = require('aws-sdk');
const axios = require('axios');

exports.remindUpdateElectricAndWater = async () => {
    const currentDate = new Date()
    try {
        const list = await Customer.find()
        const title = "Nhà trọ thông báo"
        const content = `Nhắc nhở cập nhật chỉ số điện nước tháng ${String(currentDate.getMonth() + 1)}!!!`
        list.forEach(customer => {
            //console.log(customer.Email)
            common.sendEmail(customer.Email, title, content)
        });
    } catch (err) {
        console.log("error: ", err)
    }
}
exports.test = async () => {
    //     61b4a2b5cb46ab3aa0585c72
    const existUtil = await UtilityBill.find({ RoomId: "61b8b868c29882160c20ac83", Time: { $lt: "2021-06-29T17:00:00.000+00:00" } })
        .sort({ Time: 'desc' }).limit(1)
    console.log(existUtil)
}
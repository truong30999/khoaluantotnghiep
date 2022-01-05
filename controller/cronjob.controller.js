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
    const roomchat = await Roomchat.find({ Members: ["5ff33bd0abc73325a8163c6d", "61b4a2b5cb46ab3aa0585c72"] })
    console.log(roomchat)
}
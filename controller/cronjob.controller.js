const Customer = require("../models/Customer.model")
const Room = require("../models/Room.model")
const House = require("../models/House.model")

const common = require("../utility/common")
const UtilityBill = require("../models/Utilitybills.model")
const config = require("../config/config")
const AWS = require('aws-sdk');

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
    const house = await House.aggregate([
        {
            $match: {
                NumberOfReview: { $gt: 0 }
            }
        }
    ])
        .addFields({ score: { $divide: ["$TotalRating", "$NumberOfReview"] } })
        .sort({ score: 'desc' });
    console.log(house)
}
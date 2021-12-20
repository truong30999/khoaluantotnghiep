const Customer = require("../models/Customer.model")
const Room = require("../models/Room.model")
const House = require("../models/House.model")

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
    const paramsAPI = {
        "to": "efAXIF75Scq5Wg_ZfWsfSk:APA91bHUQIpsPtPVwiLxDh-k3olgOyQwt0ZDjHjf492dNugfoGknW3NVo3I8-BSOIy54ly6UhTjtJVsXKTECsdi79o6kbPo0hKVr_M7q_ocjf33di1faFdz-129dUJZ__w-o3mvKySN0",
        "notification": {
            "title": "AppPhongTro",
            "body": `Đã có hóa đơn tháng ${9}`
        },
        "priority": "high",
        "data": {
        }
    }
    await axios.post("https://fcm.googleapis.com/fcm/send", paramsAPI, { headers: { Authorization: 'key=' + config.API_FIREBASE_PUSH_NOTIFI } })
}
const Customer = require("../models/Customer.model")
const common = require("../utility/common")
const currentDate = new Date()

exports.remindUpdateElectricAndWater = async () => {
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
    const customerEventEmitter = Customer.watch()
    personEventEmitter.on('change', change => console.log(JSON.stringify(change)))
}
const Customer = require("../models/Customer.model")
const common = require("../utility/common")
const UtilityBill = require("../models/Utilitybills.model")


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
    let listUl = await UtilityBill.find({
        RoomId: "61701280e3df574a2855dfce"
    }).sort({ Time: 'desc' }).limit(3)
    console.log(listUl)
}
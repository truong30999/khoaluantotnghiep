const Bill = require('../models/Bill.model')
const Room = require('../models/Room.model')
const House = require('../models/House.model')
const UtilityBill = require('../models/Utilitybills.model')
const Statistical = require('../models/Statistical.model')
const _ = require('underscore');
const axios = require('axios');
const NodeRSA = require('node-rsa');
const crypto = require('crypto');
const config = require("../config/config")
exports.createBill = async (req, res) => {
    const result = await this.calculateBill(req.body.RoomId, req.body.Month)
    return res.json(result)
}
exports.recalculateBill = async (req, res) => {
    try {
        const bill = await Bill.findById(req.params.billId)
        const date = new Date(bill.EndDate)
        const currentMonth = new Date(bill.EndDate)
        bill.TotalBill = 0
        bill.OtherCosts = ""
        const listUl = await UtilityBill.find({
            RoomId: bill.RoomId,
            Time: { $lte: date }
        }).sort({ Time: 'desc' }).limit(2)
        const room = await Room.findOne({ _id: bill.RoomId }).populate("ListService")

        if (isSameTime(listUl[0].Time, bill.EndDate)) {
            //lấy hóa đơn điện nước của tháng hiện tại
            let currUl = listUl[0]
            //lấy hóa đơn điện nước của tháng trước
            let prevUl = listUl[1]
            bill.AmountOfElectric = (currUl["ElectricNumber"] - prevUl["ElectricNumber"])
            bill.AmountOfWater = (currUl["WaterNumber"] - prevUl["WaterNumber"])
            //tính tiền dựa vào dịch vụ của phòng
            for (const sv in room.ListService) {
                let str = String(clearVNSign(room.ListService[sv]["ServiceName"])).toLowerCase()
                switch (str) {
                    case "dien":
                        bill.ElectricFee = room.ListService[sv]["Price"] * bill.AmountOfElectric
                        break
                    case "nuoc":
                        bill.WaterFee = room.ListService[sv]["Price"] * bill.AmountOfWater
                        break
                    default:
                        bill.TotalBill += room.ListService[sv]["Price"]
                        bill.OtherCosts += (room.ListService[sv]["ServiceName"] + ": " + room.ListService[sv]["Price"] + "  ")
                }
            }
            bill.TotalBill += (bill.ElectricFee + bill.WaterFee + bill.RoomPrice)
            const result = await bill.save()
            room.ListPerson.map(async (customer) => {
                if (customer.DeviceToken !== null) {
                    const paramsAPI = {
                        "to": customer.DeviceToken,
                        "notification": {
                            "title": "Nhà Trọ Huy",
                            "body": `Đã tính lại hóa đơn tháng ${(currentMonth.getMonth() + 1)}`
                        },
                        "priority": "high",
                        "data": {
                        }
                    }
                    await axios.post("https://fcm.googleapis.com/fcm/send", paramsAPI, { headers: { Authorization: 'key=' + config.API_FIREBASE_PUSH_NOTIFI } })
                }
            })
            return res.json(result);
        }
        res.json({ error: "Không có chỉ số điện nước" })
    } catch (error) {
        res.json({ message: error.message })
    }
}
exports.updateBill = async (req, res) => {
    try {
        var update = req.body
        const updateBill = await Bill.updateOne(
            { _id: req.params.billId },
            { $set: update }
        )
        res.json(updateBill)
    } catch (error) {
        res.json({ message: error.message })
    }
}
exports.confirmPayment = async (req, res) => {
    const billId = req.params.billId
    const bill = await Bill.findById(billId)
    const requestId = config.MOMO.partnerCode + new Date().getTime()
    const { fromapp, momoToken, phonenumber, message } = req.body
    const urlmomo = " https://test-payment.momo.vn"
    //create hash-----------------------------------------
    const pubKey = '-----BEGIN PUBLIC KEY-----' + config.MOMO.public_key + '-----END PUBLIC KEY-----'
    const key = new NodeRSA(pubKey, { encryptionScheme: 'pkcs1' });
    const jsonData = {
        "partnerCode": config.MOMO.partnerCode,
        "partnerRefId": requestId,
        "amount": bill.TotalBill
    };
    const encrypted = key.encrypt(JSON.stringify(jsonData), 'base64');
    //----------------------------------------------------
    try {
        const data = {
            partnerCode: config.MOMO.partnerCode,
            partnerRefId: billId,
            customerNumber: phonenumber,
            appData: momoToken,
            hash: encrypted,
            payType: 3,
            version: 3
        }
        axios.post(`${urlmomo}/pay/app`, data).then(async (response) => {
            console.log(response.data)
            if (response.data.status === 0) {
                bill.Status = 1
                await bill.save()
                res.json({ message: "Thanh toán thành công", billId: billId })
                //tạo chữ kí (signature)
                const requestType = "capture"

                const momoTransId = response.data.transid
                const rawSignature = "partnerCode=" + config.MOMO.partnerCode + "&partnerRefId=" + billId + "&requestType=" + requestType + "&requestId=" + requestId + "&momoTransId=" + momoTransId
                console.log("rawSignature", rawSignature)
                const signature = crypto.createHmac('sha256', config.MOMO.secret_key)
                    .update(rawSignature)
                    .digest('hex');
                console.log("signature ", signature)
                axios.post(`${urlmomo}/pay/confirm`, {
                    "partnerCode": config.MOMO.partnerCode,
                    "partnerRefId": requestId,
                    "requestType": requestType,
                    "requestId": requestId,
                    "momoTransId": momoTransId,
                    "signature": signature,
                    "customerNumber": phonenumber
                }).then((res) => {
                    console.log(res.data)
                })
            } else {
                res.json({ error: "Thanh toán thất bại" })
            }

        })
    } catch (error) {
        res.json({ message: error.message })
    }
}
exports.updateStatus = async (req, res) => {
    // req.params.billId
    try {
        const bill = await Bill.findById(req.params.billId)
        const room = await Room.findById(bill.RoomId)
        if (bill.Status === 1) {
            return res.json({ error: "Hóa đơn đã thanh toán" })
        }
        bill.Status = 1
        const result = await bill.save()
        const date = bill.EndDate
        const existStatistical = await Statistical.find({ HouseId: room.HouseId, Year: date.getFullYear(), Month: date.getMonth() + 1 })
        if (_.isEmpty(existStatistical)) {
            const newStatistical = new Statistical({
                HouseId: room.HouseId,
                Year: date.getFullYear(),
                Month: (date.getMonth() + 1),
                TotalRevenue: bill.TotalBill
            })
            await newStatistical.save()
        } else {
            const statistical = await Statistical.findById(existStatistical[0]._id)
            statistical.TotalRevenue += bill.TotalBill
            await statistical.save()
        }
        res.json(result)
    } catch (error) {
        res.json({ message: error.message })
    }
}
exports.deleteBill = async (req, res) => {
    try {
        const bill = await Bill.findById(req.params.billId)
        const room = await Room.findById(bill.RoomId)
        const pos = room.ListBill.indexOf(req.params.billId)
        room.ListBill.splice(pos, 1)
        await room.save()
        const deleteBill = await Bill.remove({ _id: req.params.billId })
        res.json(deleteBill)
    } catch (error) {
        res.json({ message: error.message })
    }
}
exports.getBillById = async (req, res) => {
    try {
        const bill = await Bill.findById(req.params.billId).populate({
            path: 'RoomId',
            select: 'RoomNumber'
        })
        res.json(bill)
    } catch (err) {
        res.json({ message: err.message })
    }

}
exports.getBillInMonthOfUser = async (req, res) => {
    // có month và houseId
    try {
        const date = new Date(req.body.Month)
        const currentMonth = new Date(date.getFullYear(), date.getMonth() + 1, 0)
        const listRoom = await Room.find({ HouseId: req.body.HouseId }, 'RoomNumber Status').populate({
            path: 'ListBill',
            match: { EndDate: currentMonth }
        })
        res.json(listRoom)

    } catch (error) {
        res.json({ message: error.message })
    }
}
exports.getAllBill = async (req, res) => {
    try {
        const bill = await Bill.find()
        res.json(bill)
    } catch (err) {
        res.json({ message: err.message })
    }

}
exports.calculateBill = async (RoomId, Month) => {
    const date = new Date(Month)
    const previousMonth = new Date(date.getFullYear(), date.getMonth(), 0)
    const currentMonth = new Date(date.getFullYear(), date.getMonth() + 1, 0)
    const existBill = await Bill.find({ RoomId: RoomId, EndDate: currentMonth })
    if (existBill.length > 0) { return { "error": "Hóa đơn đã tồn tại" } }
    const bill = new Bill({
        RoomId: RoomId,
        DateCreate: new Date(),
        StartDate: previousMonth,
        EndDate: currentMonth,
        TotalBill: 0,
        OtherCosts: "",
        WaterFee: 0,
        ElectricFee: 0,
        AmountOfElectric: 0,
        AmountOfWater: 0,
        Status: 0
    })
    //lấy dịch vụ của phòng
    const room = await Room.findOne({ _id: RoomId }).populate("ListService").populate("ListPerson", "DeviceToken")
    bill.RoomPrice = room.Price
    bill.RoomNumber = room.RoomNumber
    const listUl = await UtilityBill.find({
        RoomId: RoomId,
        Time: { $lte: currentMonth }
    }).sort({ Time: 'desc' }).limit(2)
    try {
        if (isSameTime(listUl[0].Time, currentMonth)) {
            //lấy hóa đơn điện nước của tháng hiện tại
            let currUl = listUl[0]
            //lấy hóa đơn điện nước của tháng trước
            let prevUl = listUl[1]
            bill.AmountOfElectric = (currUl["ElectricNumber"] - prevUl["ElectricNumber"])
            bill.AmountOfWater = (currUl["WaterNumber"] - prevUl["WaterNumber"])
            //tính tiền dựa vào dịch vụ của phòng
            for (const sv in room.ListService) {
                let str = String(clearVNSign(room.ListService[sv]["ServiceName"])).toLowerCase()
                switch (str) {
                    case "dien":
                        bill.ElectricFee = room.ListService[sv]["Price"] * bill.AmountOfElectric
                        break
                    case "nuoc":
                        bill.WaterFee = room.ListService[sv]["Price"] * bill.AmountOfWater
                        break
                    default:
                        bill.TotalBill += room.ListService[sv]["Price"]
                        bill.OtherCosts += (room.ListService[sv]["ServiceName"] + ": " + room.ListService[sv]["Price"] + "  ")
                }
            }
            bill.TotalBill += (bill.ElectricFee + bill.WaterFee + bill.RoomPrice)
            const result = await bill.save()
            room.ListBill.push(result["_id"])
            await room.save()
            // push notification to app
            room.ListPerson.map(async (customer) => {
                if (customer.DeviceToken !== null) {
                    const paramsAPI = {
                        "to": customer.DeviceToken,
                        "notification": {
                            "title": "Nhà Trọ Huy",
                            "body": `Đã có hóa đơn tháng ${(currentMonth.getMonth() + 1)}`
                        },
                        "priority": "high",
                        "data": {
                        }
                    }
                    await axios.post("https://fcm.googleapis.com/fcm/send", paramsAPI, { headers: { Authorization: 'key=' + config.API_FIREBASE_PUSH_NOTIFI } })
                }
            })
            return result;
        }
        else {
            return { error: "Chưa có chỉ số điện nước" }
        }

    } catch (err) {
        return { error: err }

    }

}
const isSameMonthYear = (a, b) => {
    return a.getFullYear() === b.getFullYear() &&
        a.getMonth() === b.getMonth()
}
function clearVNSign(str) {
    str = str.replace(/à|á|ạ|ả|ã|â|ầ|ấ|ậ|ẩ|ẫ|ă|ằ|ắ|ặ|ẳ|ẵ/g, "a");
    str = str.replace(/è|é|ẹ|ẻ|ẽ|ê|ề|ế|ệ|ể|ễ/g, "e");
    str = str.replace(/ì|í|ị|ỉ|ĩ/g, "i");
    str = str.replace(/ò|ó|ọ|ỏ|õ|ô|ồ|ố|ộ|ổ|ỗ|ơ|ờ|ớ|ợ|ở|ỡ/g, "o");
    str = str.replace(/ù|ú|ụ|ủ|ũ|ư|ừ|ứ|ự|ử|ữ/g, "u");
    str = str.replace(/ỳ|ý|ỵ|ỷ|ỹ/g, "y");
    str = str.replace(/đ/g, "d");
    str = str.replace(/À|Á|Ạ|Ả|Ã|Â|Ầ|Ấ|Ậ|Ẩ|Ẫ|Ă|Ằ|Ắ|Ặ|Ẳ|Ẵ/g, "A");
    str = str.replace(/È|É|Ẹ|Ẻ|Ẽ|Ê|Ề|Ế|Ệ|Ể|Ễ/g, "E");
    str = str.replace(/Ì|Í|Ị|Ỉ|Ĩ/g, "I");
    str = str.replace(/Ò|Ó|Ọ|Ỏ|Õ|Ô|Ồ|Ố|Ộ|Ổ|Ỗ|Ơ|Ờ|Ớ|Ợ|Ở|Ỡ/g, "O");
    str = str.replace(/Ù|Ú|Ụ|Ủ|Ũ|Ư|Ừ|Ứ|Ự|Ử|Ữ/g, "U");
    str = str.replace(/Ỳ|Ý|Ỵ|Ỷ|Ỹ/g, "Y");
    str = str.replace(/Đ/g, "D");
    return str;
}
const isSameTime = (a, b) => a.getTime() === b.getTime()
const Bill = require('../models/Bill.model')
const Room = require('../models/Room.model')
const House = require('../models/House.model')
const UtilityBill = require('../models/Utilitybills.model')


exports.createBill = async (req, res) => {
    const result = await this.calculateBill(req.body.RoomId, req.body.Month)
    return res.json(result)
}
exports.recalculateBill = async (req, res) => {
    try {
        const bill = await Bill.findById(req.params.billId)
        const date = new Date(bill.EndDate)
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
exports.deleteBill = async (req, res) => {
    try {
        const bill = await Bill.findById(req.params.billId)
        const room = await Room.findById(bill.RoomId)
        const pos = room.ListBill.indexOf(req.params.billId)
        room.ListBill.splice(pos, 1)
        room.save()
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
exports.getBillOfCustomer = async (req, res) => {

}
exports.getBillInMonthOfUser = async (req, res) => {
    // có month và houseId
    try {
        const date = new Date(req.body.Month)
        const currentMonth = new Date(date.getFullYear(), date.getMonth() + 1)
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
    const previousMonth = new Date(date.getFullYear(), date.getMonth())
    const currentMonth = new Date(date.getFullYear(), date.getMonth() + 1)
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
    const room = await Room.findOne({ _id: RoomId }).populate("ListService")
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
            room.save()
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
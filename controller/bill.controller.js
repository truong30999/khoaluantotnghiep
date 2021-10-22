const Bill = require('../models/Bill.model')
const Room = require('../models/Room.model')
const House = require('../models/House.model')
const UtilityBill = require('../models/Utilitybills.model')

const today = new Date()
const prevmonth = new Date()
prevmonth.setMonth(prevmonth.getMonth() - 1)



exports.createBill = async (req, res) => {
    try {

        const bill = new Bill({
            RoomId: req.body.RoomId,
            DateCreate: new Date(),
            StartDate: new Date(today.getFullYear(), today.getMonth()),
            EndDate: new Date(today.getFullYear(), today.getMonth()),
            TotalBill: 0,
            OtherCosts: "",
            WaterFee: 0,
            ElectricFee: 0,
            AmountOfElectric: 0,
            AmountOfWater: 0,
            Status: 0
        })
        bill.EndDate.setMonth(today.getMonth() + 1)
        //lấy dịch vụ của phòng
        const room = await Room.findOne({ _id: req.body.RoomId }).populate("ListService")
        bill.RoomPrice = room.Price
        bill.RoomNumber = room.RoomNumber


        //lấy hóa đơn điện nước của tháng hiện tại
        let listUl = await UtilityBill.find({
            RoomId: req.body.RoomId,
        })
        var currUl
        for (const index in listUl) {
            if (isSameMonthYear(listUl[index]["Time"], today)) {
                currUl = listUl[index]
            }
        }

        //lấy hóa đơn điện nước của tháng trước
        var prevUl
        for (const index in listUl) {
            if (isSameMonthYear(listUl[index]["Time"], prevmonth)) {
                prevUl = listUl[index]
            }
        }
        bill.AmountOfElectric = (currUl["ElectricNumber"] - prevUl["ElectricNumber"])
        bill.AmountOfWater = (currUl["WaterNumber"] - prevUl["WaterNumber"])
        //tính tiền dựa vào dịch vụ của phòng
        for (const sv in room.ListService) {
            let str = String(clearVNSign(room.ListService[sv]["ServiceName"])).toLowerCase()
            switch (str) {
                case "dien":
                    bill.ElectricFee = room.ListService[sv]["Price"] * (currUl["ElectricNumber"] - prevUl["ElectricNumber"])
                    break
                case "nuoc":
                    bill.WaterFee = room.ListService[sv]["Price"] * (currUl["WaterNumber"] - prevUl["WaterNumber"])
                    break
                default:
                    bill.TotalBill += room.ListService[sv]["Price"]
                    bill.OtherCosts += (room.ListService[sv]["ServiceName"] + ": " + room.ListService[sv]["Price"] + "  ")
            }
        }
        bill.TotalBill += bill.ElectricFee + bill.WaterFee + bill.RoomPrice
        const result = await bill.save()
        room.ListBill.push(result["_id"])
        room.save()
        res.json(bill)

    } catch (err) {
        res.json({ message: err.message })

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
        const bill = await Bill.findById(req.params.billId)
        res.json(bill)
    } catch (err) {
        res.json({ message: err.message })
    }

}
exports.getBillInMonth = async (req, res) => {
    try {

        const month = new Date(today.getFullYear(), today.getMonth())
        const ListBill = await Bill.find({ StartDate: month })

        res.json(ListBill)
    } catch (error) {
        res.json({ message: error.message })
    }
}
exports.getBillInMonthOfUser = async (req, res) => {
    try {
        if (req.query.Month) {
            const month = new Date(req.query.Month)
            const list = await House.find({ UserId: req.query.UserId, _id: req.query.HouseId })
                .populate({
                    path: 'Rooms',
                    populate: {
                        path: 'ListBill', match: { StartDate: month }
                    }
                })
            return res.json(list)
        }

        const month = new Date(today.getFullYear(), today.getMonth())
        const list = await House.find({ _id: req.query.HouseId, UserId: req.query.UserId })
            .populate({
                path: 'Rooms',
                populate: {
                    path: 'ListBill', match: { StartDate: month }
                }
            })
        res.json(list)


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

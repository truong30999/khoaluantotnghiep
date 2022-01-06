const UtilityBill = require('../models/Utilitybills.model')
const Room = require('../models/Room.model')
const House = require('../models/House.model')

exports.createUtilityBills = async (req, res) => {
    try {
        const time = new Date(req.body.Time)
        const abc = new Date(time.getFullYear(), time.getMonth() + 1, 0)
        const existUtil = await UtilityBill.find({ RoomId: req.body.RoomId, Time: abc })
        if (existUtil.length !== 0) {
            res.json({ error: "Chỉ số đã tồn tại" })
            return
        }
        const prevUtil = await UtilityBill.find({ RoomId: req.body.RoomId, Time: { $lt: abc } }).sort({ Time: 'desc' }).limit(1)
        if (prevUtil.length !== 0) {
            if (prevUtil[0].ElectricNumber > req.body.ElectricNumber || prevUtil[0].WaterNumber > req.body.WaterNumber) {
                res.json({ error: "Nhập sai chỉ số" })
            }
            else {
                const ult = new UtilityBill({
                    Time: abc,
                    ElectricNumber: req.body.ElectricNumber,
                    WaterNumber: req.body.WaterNumber,
                    RoomId: req.body.RoomId
                })
                const result = await ult.save()
                const room = await Room.findById(req.body.RoomId)
                room.ListUtilityBill.push(result["_id"])
                await room.save()
                res.json(result)
            }
        }
        else {
            const ult = new UtilityBill({
                Time: abc,
                ElectricNumber: req.body.ElectricNumber,
                WaterNumber: req.body.WaterNumber,
                RoomId: req.body.RoomId
            })
            const result = await ult.save()
            const room = await Room.findById(req.body.RoomId)
            room.ListUtilityBill.push(result["_id"])
            await room.save()
            res.json(result)
        }

    }
    catch (err) {
        res.json({ message: err })
    }


}
exports.getAllUtilityByRoom = async (req, res) => {
    try {
        const time = new Date(req.body.Month)
        const abc = new Date(time.getFullYear(), time.getMonth() + 1, 0)
        const listRoom = await Room.find({ HouseId: req.body.HouseId }, 'RoomNumber Status').populate({
            path: 'ListUtilityBill',
            match: { Time: abc }
        })
        res.json(listRoom)

    } catch (error) {
        console.log(error.message)
        res.json({ message: error.message })
    }
}
exports.getById = async (req, res) => {
    try {
        const ult = await UtilityBill.findById(req.params.Id)
        res.json(ult)

    } catch (err) {
        res.json({ message: err })
    }

}
exports.update = async (req, res) => {
    try {
        const update = req.body
        const result = await UtilityBill.updateOne(
            { _id: req.params.Id },
            { $set: update }
        );
        res.json(result)
    } catch (err) {
        res.json({ message: err })
    }
}
exports.delete = async (req, res) => {
    try {
        const utl = await UtilityBill.findById(req.params.Id)
        const room = await Room.findById(utl.RoomId)
        const pos = room.ListUtilityBill.indexOf(req.params.Id)
        room.ListUtilityBill.splice(pos, 1)
        await room.save()
        const result = await UtilityBill.remove({ _id: req.params.Id })

        res.json(result)
    } catch (err) {
        res.json({ message: err.message })
    }
}

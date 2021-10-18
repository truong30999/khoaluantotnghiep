const Contract = require('../models/Contract.model')
const Room = require('../models/Room.model')
const House = require('../models/House.model')

exports.createContract = async (req, res) => {
    try {
        const contract = new Contract(req.body)
        const result = await contract.save()
        res.json(result)
    } catch (error) {
        res.json({ message: error.message })
    }
}
exports.detailContract = async (req, res) => {
    try {
        const contract = await Contract.findById(req.params.contractId)
        res.json(contract)
    } catch (error) {
        res.json({ message: error.message })
    }
}
exports.editStatus = async (req, res) => {
    try {
        const contract = await Contract.findOneAndUpdate({ _id: req.params.contractId }, { Status: req.body.Status })
        res.json(contract)
    } catch (error) {
        res.json({ message: error.message })
    }
}
exports.deleteContract = async (req, res) => {
    try {
        const result = await Contract.deleteOne({ _id: req.params.contractId })
        res.json(result)
    } catch (error) {
        res.json({ message: error.message })
    }
}
//lấy contract theo nhà, phòng, người dùng
exports.getContractOfUser = async (req, res) => {
    try {

        if (req.query.house) {
            const result = await Contract.find({ Lessor: req.jwt.userId, House: req.query.house })
                .populate("Lessor", "Name")
                .populate("Renter", "Name")
                .populate("House", "Name")
                .populate("Room", "RoomNumber")
            return res.json(result)
        }
        if (req.query.room) {
            const result = await Contract.find({ Lessor: req.jwt.userId, Room: req.query.room }).populate("Lessor", "Name")
                .populate("Renter", "Name")
                .populate("House", "Name")
                .populate("Room", "RoomNumber")
            return res.json(result)
        }
        const result = await Contract.find({ Lessor: req.jwt.userId })
            .populate("Lessor", "Name")
            .populate("Renter", "Name")
            .populate("House", "Name")
            .populate("Room", "RoomNumber")
        res.json(result)
    } catch (error) {
        res.json({ message: error.message })
    }
}
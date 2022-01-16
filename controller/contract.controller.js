const Contract = require('../models/Contract.model')
const Room = require('../models/Room.model')
const Customer = require("../models/Customer.model")
const House = require("../models/House.model")

exports.createContract = async (req, res) => {
    try {
        const contract = new Contract(req.body)
        const customer = await Customer.findById(req.body.Renter)
        const room = await Room.findById(customer.RoomId)
        const house = await House.findById(room.HouseId)
        contract.House = room.HouseId
        contract.Room = customer.RoomId
        contract.Rent = room.Price
        contract.AddressHouse = `${house.Address}, ${house.Ward}, ${house.District}, ${house.Province}`
        contract.Terms = ""
        const result = await contract.save()
        res.json(result)
    } catch (error) {
        res.json({ error })
    }
}
exports.detailContract = async (req, res) => {
    try {
        const contract = await Contract.findById(req.params.contractId)
            .populate("Lessor", "Name")
            .populate("Renter", "Name")
            .populate("House", "Name")
            .populate("Room", "RoomNumber")
        res.json(contract)
    } catch (error) {
        res.json({ error })
    }
}
exports.editContract = async (req, res) => {
    try {
        const contract = await Contract.findOneAndUpdate({ _id: req.params.contractId }, { $set: req.body })
        res.json(contract)
    } catch (error) {
        res.json({ error })
    }
}
exports.updateStatus = async (req, res) => {
    try {
        const contract = await Contract.findOneAndUpdate({ _id: req.params.contractId }, { Status: req.body.Status })
        res.json(contract)
    } catch (error) {
        res.json({ error })
    }
}
exports.deleteContract = async (req, res) => {
    try {
        const result = await Contract.deleteOne({ _id: req.params.contractId })
        res.json(result)
    } catch (error) {
        res.json({ error })
    }
}
//lấy contract theo nhà, phòng, người dùng
exports.getContractOfUser = async (req, res) => {
    const today = new Date()
    const res = await Contract.updateMany({ Lessor: req.jwt.userId, ExpirationDate: { $lt: today } }, { Status: -1 })
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
        res.json({ error })
    }
}
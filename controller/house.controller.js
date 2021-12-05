const House = require('../models/House.model')
const User = require('../models/User.model')

exports.createHouse = async (req, res) => {
    const house = new House({
        Name: req.body.Name,
        Room: req.body.Room,
        UserId: req.body.UserId,
        Province: req.body.Province,
        District: req.body.District,
        Ward: req.body.Ward,
        Address: req.body.Address,
        TotalRating: 0,
        NumberOfReview: 0
    })
    try {
        const createHouse = await house.save()
        const user = await User.findById({ _id: house.UserId })
        user.House.push(createHouse["_id"])
        await user.save()
        res.json(createHouse)
    } catch (err) {
        res.json({ message: err.message })
    }
}
exports.getAllHouse = async (req, res) => {
    try {
        const allHouse = await House.find()
        res.json(allHouse)
    } catch (err) {
        res.json({ message: err })
    }
}
exports.getAllHouseOfUser = async (req, res) => {
    try {
        const allHouse = await House.find({ UserId: req.jwt.userId })
        res.json(allHouse)
    } catch (err) {
        res.json({ message: err })
    }
}
exports.getHouseById = async (req, res) => {
    try {
        const house = await House.findById(req.params.houseId).populate("Rooms")
        res.json(house)
    } catch (err) {
        res.json({ message: err })
    }
}
exports.updateHouse = async (req, res) => {
    try {
        let house = req.body
        const updateHouse = await House.updateOne(
            { _id: req.params.houseId },
            { $set: house }
        )
        res.json(updateHouse)
    } catch (err) {
        res.json({ message: err })
    }
}
exports.deleteHouse = async (req, res) => {
    try {
        const house = await House.findById(req.params.houseId)
        const user = await User.findById(house.UserId)
        const pos = user.House.indexOf(req.params.houseId)
        user.House.splice(pos, 1)
        await user.save()
        const removeHouse = await House.remove({ _id: req.params.houseId })
        res.json(removeHouse)
    }
    catch (err) {
        res.json({ message: err })
    }
}



const Room = require('../models/Room.model')
const House = require('../models/House.model')
const Roomchat = require('../models/Roomchat.model')

const Service = require('../models/Services.model')
const Customer = require('../models/Customer.model')
const config = require('../config/config')
const common = require('../utility/common')
const UtilityBill = require('../models/Utilitybills.model')
const fs = require('fs');


exports.createRoom = async (req, res) => {
    const today = new Date()
    const timeUtility = new Date(today.getFullYear(), today.getMonth(), 0)
    let imgArr = common.convertArrImage(req.files)
    const room = new Room({
        RoomNumber: req.body.RoomNumber,
        Length: req.body.Length,
        Width: req.body.Width,
        Price: req.body.Price,
        Details: req.body.Details,
        Image: imgArr,
        HouseId: req.body.HouseId,
        ListPerson: [],
        TimePost: null,
        Status: 0
    })
    try {
        const service = await Service.find({ UserId: req.jwt.userId }, { _id: 1 })
        const newUtility = new UtilityBill({
            Time: timeUtility,
            ElectricNumber: 0,
            WaterNumber: 0,
            RoomId: room._id
        })
        await newUtility.save()
        room.ListUtilityBill.push(newUtility._id)
        for (const id in service) {
            room.ListService.push(service[id]["_id"])

        }
        const createRoom = await room.save();
        const house = await House.findById({ _id: req.body.HouseId })
        house.Rooms.push(createRoom)
        await house.save()
        res.json(createRoom)

    } catch (err) {
        res.json({ message: err.message })
    }

}
exports.updateRoom = async (req, res) => {
    //delete old image if add new image
    const room = await Room.findById(req.params.roomId)
    let newRoom = req.body

    if (req.files && req.files.length) {
        let imgArr = common.convertArrImage(req.files)
        newRoom.Image = imgArr
        if (room.Image && room.Image.length) {
            room.Image.map((img) => {
                fs.unlink(img, err => {
                    console.log(err.message);
                });
            })
        }
    }
    try {

        const updateRoom = await Room.updateOne(
            { _id: req.params.roomId },
            { $set: newRoom }
        )
        res.json(updateRoom)
    } catch (err) {
        res.json({ message: err })
    }
}
exports.getAllRoom = async (req, res) => {
    try {
        const room = await Room.find()
        res.json(room)
    } catch (err) {
        res.json({ message: err })
    }

}

exports.getRoomByHouse = async (req, res) => {
    try {
        const room = await Room.find({ HouseId: req.params.houseId })
        res.json(room)
    } catch (err) {
        res.json({ message: err })
    }


}
exports.getRoomById = async (req, res) => {
    try {
        const room = await Room.findById(req.params.roomId)
        res.json(room)
    } catch (err) {
        res.json({ message: err })
    }

}
exports.deleteRoom = async (req, res) => {
    try {
        const room = await Room.findById(req.params.roomId)
        const house = await House.findById(room.HouseId)
        const pos = house.Rooms.indexOf(req.params.roomId)
        house.Rooms.splice(pos, 1)
        house.save()
        if (room.Image.length > 0) {
            room.Image.forEach((image) => {
                fs.unlink(image, err => {
                    console.log(err);
                });
            })
        }
        const removeRoom = await Room.remove({ _id: req.params.roomId })

        res.json(removeRoom)
    }
    catch (err) {
        res.json({ message: err })
    }
}
//them mot nguoi vao phong
exports.addPersonToRoom = async (req, res) => {
    try {
        const newRoom = await Room.findById(req.params.roomId).populate({
            path: 'HouseId',
            select: "Name",
            populate: { path: 'UserId', select: "Name" }
        })
        const customer = await Customer.findById(req.params.customerId)
        if (customer.RoomId) {
            const oldRoom = await Room.findById(customer.RoomId)
            const selectIndex = oldRoom.ListPerson.indexOf(req.params.customerId)
            oldRoom.ListPerson.splice(selectIndex, 1)
            if (!oldRoom.ListPerson.length) {
                oldRoom.Status = 0
            }
            await oldRoom.save()
        }
        customer.RoomId = req.params.roomId
        newRoom.ListPerson.push(req.params.customerId)
        newRoom.Status = 1
        await newRoom.save()
        const result = await customer.save()

        // Create chat between customer and user
        const chatroom = new Roomchat({
            Members: [customer._id, newRoom.HouseId.UserId._id]
        })
        await chatroom.save();
        res.json(result)
    } catch (error) {
        res.json({ message: error.message })
    }
}
//xoa mot nguoi khoi phong
exports.removePersonToRoom = async (req, res) => {
    try {
        const room = await Room.findById(req.params.roomId)
        const pos = room.ListPerson.indexOf(req.params.customerId)
        room.ListPerson.splice(pos, 1)
        if (room.ListPerson.length === 0) {
            room.Status = 0
        }
        const customer = await Customer.findById(req.params.customerId)
        customer.RoomId = null
        await customer.save()
        const result = await room.save()
        res.json(result)
    } catch (error) {
        res.json({ message: error.message })
    }
}
//them mot dich vu vao phong
exports.addServiceToRoom = async (req, res) => {
    try {
        const room = await Room.findById(req.params.roomId)
        room.ListService.push(req.params.serviceId)
        const result = await room.save()
        res.json(result)
    } catch (error) {
        res.json({ message: error.message })
    }
}
//xoa mot nguoi khoi phong
exports.removeServiceToRoom = async (req, res) => {
    try {
        const room = await Room.findById(req.params.roomId)
        const pos = room.ListService.indexOf(req.params.serviceId)
        room.ListService.splice(pos, 1)
        const result = await room.save()
        res.json(result)
    } catch (error) {
        res.json({ message: error.message })
    }
}

//lay tat ca nguoi trong phong
exports.getPersonInRoom = async (req, res) => {
    try {
        const room = await Room.findOne({ _id: req.params.roomId }).populate("ListPerson")
        const person = room["ListPerson"]
        res.json(person)


    } catch (error) {
        res.json({ message: error.message })
    }
}
//lay tat ca dich vu cua phong
exports.getServiceOfRoom = async (req, res) => {
    try {
        const room = await Room.findOne({ _id: req.params.roomId }).populate("ListService")
        const service = room["ListService"]
        res.json(service)


    } catch (error) {
        res.json({ message: error.message })
    }
}

exports.getEmptyRoom = async (req, res) => {
    try {

        const house = await House.find({ UserId: req.jwt.userId })
            .populate({
                path: 'Rooms',
                match: { Status: 0 }
            })
        let roomNumber = 0;
        house.forEach(h => {
            roomNumber += h.Rooms.length
        })
        res.json({ AmountOfRoom: roomNumber })
    } catch (error) {
        res.json({ message: error.message })
    }
}
exports.getNotEmptyRoom = async (req, res) => {
    try {
        const house = await House.find({ UserId: req.jwt.userId })
            .populate({
                path: 'Rooms',
                match: { Status: 1 }
            })
        let roomNumber = 0;
        house.forEach(h => {
            roomNumber += h.Rooms.length
        })
        res.json({ AmountOfRoom: roomNumber })
    } catch (error) {
        res.json({ message: error.message })
    }
}
exports.postRoom = async (req, res) => {
    //req.params.roomId
    try {
        const date = new Date()
        const room = await Room.findOneAndUpdate({ _id: req.params.roomId }, { Status: 3, TimePost: date })
        res.json(room)
    } catch (error) {
        res.json({ message: error })
    }
}
exports.unpostRoom = async (req, res) => {
    //req.params.roomId
    try {
        const room = await Room.findOneAndUpdate({ _id: req.params.roomId }, { Status: 0 })
        res.json(room)
    } catch (error) {
        res.json({ message: error })
    }
}
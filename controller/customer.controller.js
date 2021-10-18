const Customer = require('../models/Customer.model')
const Room = require('../models/Room.model')
const common = require('../utility/common')
const fs = require('fs');
exports.createCustomer = async (req, res, next) => {
    let imgArr = common.convertArrImage(req.files)
    try {
        const customer = new Customer({
            Name: req.body.Name,
            Age: req.body.Age,
            DateOfBirth: req.body.DateOfBirth,
            Phone: req.body.Phone,
            Email: req.body.Email,
            PermanentAddress: req.body.PermanentAddress,
            Cmnd: req.body.Cmnd,
            DateCmnd: req.body.DateCmnd,
            PlaceCmnd: req.body.PlaceCmnd,
            Image: imgArr,
            UserId: req.jwt.userId,
            RoomId: req.body.RoomID
        })
        const room = await Room.findById(req.body.RoomId)
        if (room.ListPerson.length === 0) {
            room.Status = 1
        }
        room.ListPerson.push(customer._id)
        await room.save()
        let result = await customer.save()

        res.json(result)

    } catch (err) {
        res.json({ message: err.message })
    }

}

exports.getAllCustomerOfUser = async (req, res) => {
    try {
        const list = await Customer.find({ UserId: req.jwt.userId })

        res.json(list);
    } catch (err) {
        res.json({ message: err });
    }

}
exports.getCustomerById = async (req, res) => {
    try {
        const customer = await Customer.findById(req.params.customerId);
        res.json(customer);
    } catch (err) {
        res.json({ message: err.message });
    }
}
exports.updateCustomer = async (req, res) => {

    const customer = await Customer.findById(req.params.customerId)
    let newCustomer = req.body
    if (customer.Image && req.files) {
        let imgArr = common.convertArrImage(req.files)
        newCustomer.Image = imgArr
        customer.Image.map((img) => {
            fs.unlink(img, err => {
                console.log(err.message);
            });
        })
    }
    try {

        const updatedCustomer = await Customer.updateOne(
            { _id: req.params.customerId },
            { $set: newCustomer }

        );
        res.json(updatedCustomer);
    } catch (err) {
        res.json({ message: err.message });
    }

}
exports.deleteCustomer = async (req, res) => {
    const customer = await Customer.findById(req.params.customerId)
    const room = await Room.findById(customer.RoomId)
    const pos = room.ListPerson.indexOf(req.params.customerId)
    room.ListPerson.splice(pos, 1)
    if (room.ListPerson.length === 0) {
        room.Status = 0
    }
    await room.save()
    if (customer.Image) {
        fs.unlink(customer.Image, err => {
            console.log(err);
        });
    }
    try {

        const removeCustomer = await Customer.remove({ _id: req.params.customerId })
        res.json(removeCustomer)

    } catch (err) {
        res.json({ message: err })
    }
}



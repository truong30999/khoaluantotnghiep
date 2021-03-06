const User = require("../models/User.model");
const Message = require("../models/Message.model")
const config = require("../config/config");
const common = require("../utility/common");


exports.CreateMessage = async (req, res) => {
    // req.body.Roomchat , req.body.SenderId, req.body.Text
    req.body.Type = "User"
    const newMessage = new Message(req.body)
    try {
        const result = await newMessage.save()
        res.json(result)
    } catch (error) {
        res.json(error);
    }
}
exports.getMessageOfRoomchat = async (req, res) => {
    try {
        const result = await Message.find({ Roomchat: req.params.roomchatId })
        res.json(result)
    } catch (error) {
        res.json(error);
    }
}
exports.getMessage = async (req, res) => {
    // req.body.Roomchat , req.body.SenderId, req.body.Text
    try {
        const mesage = Message.findById(req.params.messageId)
        res.json(mesage)
    } catch (error) {
        res.json(error);
    }
}
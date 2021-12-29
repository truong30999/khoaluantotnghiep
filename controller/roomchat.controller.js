const User = require("../models/User.model");
const Roomchat = require("../models/Roomchat.model")
const config = require("../config/config");
const common = require("../utility/common");

exports.createRoomChat = async (req, res) => {
    const newChatroom = new Roomchat({
        Members: [req.body.senderId, req.body.receiverId],
    });
    try {
        const result = await newChatroom.save();
        res.json(result);
    } catch (error) {
        res.json(error);
    }
}
exports.getRoomchat = async (req, res) => {
    try {
        const roomchat = await Roomchat.find({
            Members: { $in: [req.params.Id] },
        });
        res.json(roomchat);
    } catch (error) {
        res.json(error);
    }
}

const mongoose = require('mongoose');

const roomchatSchema = mongoose.Schema({
    Members: {
        type: Array,
    },
    RoomName: {
        type: String,
    }
}, { timestamps: true });

module.exports = mongoose.model("Roomchat", roomchatSchema);


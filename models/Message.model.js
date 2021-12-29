const mongoose = require('mongoose');

const messageSchema = mongoose.Schema({
    Roomchat: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Roomchat"
    },
    SenderId: {
        type: String,
    },
    Text: {
        type: String,
    }
}, { timestamps: true });

module.exports = mongoose.model("Message", messageSchema);


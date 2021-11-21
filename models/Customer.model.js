const mongoose = require('mongoose');

const customerSchema = mongoose.Schema({

    Name: {
        type: String,
        require: true
    },
    Age: { type: Date },
    DateOfBirth: { type: Date },
    Phone: { type: String, require: true },
    Password: { type: String },
    Email: { type: String },
    PermanentAddress: {
        type: String,
        require: true
    },
    RoomId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Room"
    },
    Cmnd: { type: String, require: true },
    DateCmnd: { type: Date },
    PlaceCmnd: { type: String },
    Image: { type: Array },
    UserId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Users"
    }
});

module.exports = mongoose.model("Customers", customerSchema);

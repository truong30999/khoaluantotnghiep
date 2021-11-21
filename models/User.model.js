const mongoose = require('mongoose');

const userSchema = mongoose.Schema({

    Name: {
        type: String
    },
    Age: {
        type: Date
    },
    Email: {
        type: String,
        require: true
    },
    Phone: {
        type: String
    },
    Image: {
        type: String,

    },
    PassWord: {
        type: String,
        require: true
    },
    Type: {
        type: Number,
        require: true
    },
    PermanentAddress: {
        type: String
    },
    Cmnd: { type: String },
    DateCmnd: { type: Date },
    PlaceCmnd: { type: String },
    House: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: "House"
    }],
    ActiveCode: {
        type: Number
    },
    Status: {
        type: Number,
        require: true
    }
});

module.exports = mongoose.model("Users", userSchema);

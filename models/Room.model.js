const { Date } = require('mongoose');
const mongoose = require('mongoose');

const roomSchema = mongoose.Schema({

    RoomNumber: {
        type: Number,
        require: true,
    },
    HouseId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "House"
    },
    Length: {
        type: Number
    },
    Width: {
        type: Number
    },
    Price: {
        type: Number,
        require: true
    },
    Details: {
        type: String
    },
    Image: {
        type: Array
    },
    ListPerson: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: "Customers"
    }],
    ListService: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: "Service"
    }],
    ListUtilityBill: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: "UtilityBill"
    }],
    ListBill: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: "Bill"
    }],
    // 3: đang đăng tin, 0: trong, 1: da thue
    Status: { type: Number, require: true },
    TimePost: { type: Date }
});

module.exports = mongoose.model("Room", roomSchema);


const mongoose = require('mongoose');

const utilitybillSchema = mongoose.Schema({
    Time: { type: Date, require: true},
    ElectricNumber: { type: Number },
    WaterNumber: { type: Number },
    RoomId: {
        type: mongoose.Schema.Types.ObjectId,
        ref:"Room" 
    }



})
module.exports = mongoose.model("UtilityBill", utilitybillSchema)
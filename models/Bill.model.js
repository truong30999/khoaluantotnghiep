const mongoose = require('mongoose');
 
const billSchema = mongoose.Schema({
    RoomId: { type: mongoose.Schema.Types.ObjectId, required: true },
    RoomNumber:{type :Number},
    ElectricFee: {type: Number},
    WaterFee: {type: Number},
    RoomPrice: {type: Number},
    TotalBill: {type: Number},
    DateCreate:{type: Date},
    OtherCosts:{type: String},
    StartDate: {type: Date},
    EndDate: {type: Date},
    Status: {type: Number}
});

module.exports= mongoose.model("Bill", billSchema);

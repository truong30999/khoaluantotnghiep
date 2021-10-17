const mongoose = require('mongoose');

const contract = mongoose.Schema({
    DateCreate: { type: Date },
    // bên cho thuê
    Lessor: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Users"
    },
    // bên thuê
    Renter: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Customers"
    },
    House: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "House"
    },
    Room: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Room"
    },
    // thời gian thuê
    RentalPeriod: { type: String },
    // ngày chuyển đến
    ArrivalDate: { type: Date },
    // ngày hết hạn hợp đồng
    ExpirationDate: { type: Date },
    // tiền cọc
    Deposit: { type: Number },
    // tiền thuê phòng / 1 tháng
    Rent: { type: Number },
    // điều khoản hợp đồng
    Terms: { type: String },
    // 1: đã đồng ý
    // 0: đã hủy
    // -1: đã hết hạn
    // còn lại: chưa đông ý
    Status: { type: Number }

});

module.exports = mongoose.model("Contract", contract);
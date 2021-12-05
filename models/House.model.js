const mongoose = require('mongoose');

const houseSchema = mongoose.Schema({
    Name: { type: String },
    Address: { type: String },
    // tỉnh/thành phố
    Province: { type: String },
    // quận/huyện
    District: { type: String },
    // phường/xã
    Ward: { type: String },
    // tổng điểm đánh giá
    TotalRating: { type: Number },
    // số lượt đánh giá
    NumberOfReview: { type: Number },
    Rooms: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: "Room"
    }],
    UserId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Users"
    }

});

module.exports = mongoose.model("House", houseSchema);

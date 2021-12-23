const mongoose = require('mongoose');

const statisticalSchema = mongoose.Schema({
    HouseId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "House"
    },
    TotalRevenue: { type: Number },
    Month: { type: Number },
    Year: { type: Number }
});

module.exports = mongoose.model("Statistical", statisticalSchema);
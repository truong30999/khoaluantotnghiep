const mongoose = require('mongoose');
 
const contract = mongoose.Schema({
    DataCreate: {type: Date},
    Time:{type: Number},
    EndDate:{type: Date},
});

module.exports= mongoose.model("Contract", contract);
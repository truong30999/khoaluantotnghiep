const mongoose = require('mongoose');

const serviceSchema= mongoose.Schema({
    ServiceName:{ type: String, required: true},
    Description:{ type: String},
    Price:{ type:Number, required: true},
    UserId:{type:mongoose.Schema.Types.ObjectId , ref: "Users"}
})

module.exports= mongoose.model("Service", serviceSchema)
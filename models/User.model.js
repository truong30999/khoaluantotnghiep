const mongoose = require('mongoose');
 
const userSchema = mongoose.Schema({

    Name: {
        type: String
    },
    Age:{
        type: Number
    },
    Email: {
        type: String,
        require: true
    },
    Phone:{
        type: String
    },
    Image : { 
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
    House:[{
        type: mongoose.Schema.Types.ObjectId,
        ref: "House"
    }],
    ActiveCode:{
        type:Number
    },
    Status:{
        type: Number,
        require: true
    }
});

module.exports= mongoose.model("Users", userSchema);

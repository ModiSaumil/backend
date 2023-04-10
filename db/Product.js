const mongoose = require('mongoose');
const { stringify } = require('uuid');

const productSchema = new mongoose.Schema({
    imgname:String,
    userid:String,
    tag:String,
    instname:String,
    category:String,
    photo:String,
    dateadd:{
        type : Date,
        default: Date.now
    }
    
}, {timestamps: true}
);

module.exports = mongoose.model("photos",productSchema);
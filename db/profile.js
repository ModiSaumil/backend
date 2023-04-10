const mongoose = require('mongoose');
const { stringify } = require('uuid');

const userprofileSchema = new mongoose.Schema({
    photo:String,
    userid:String,

})


module.exports = mongoose.model("profile", userprofileSchema);
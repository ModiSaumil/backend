const mongoose = require('mongoose');
const { stringify } = require('uuid');

const InstituteSchema = new mongoose.Schema({
    instname:String,
   
})

module.exports = mongoose.model("inst",InstituteSchema);
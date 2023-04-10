const mongoose = require('mongoose');
const { stringify } = require('uuid');

const photocmt = new mongoose.Schema({
        comment:String,
        p_id:String,
        u_name:String,
        u_id:String,
    });

module.exports = mongoose.model("photocmt",photocmt);
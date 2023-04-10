const mongoose = require('mongoose');
const { stringify } = require('uuid');

const productmulSchema = new mongoose.Schema({
    imgCollection:{
        type:Array
    },
    dateadd:{
        type : Date,
        default: Date.now,
    }
}, {
    collection : 'photos'
}
);

module.exports = mongoose.model("photosmul",productmulSchema);
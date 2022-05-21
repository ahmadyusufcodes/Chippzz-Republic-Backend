const mongoose = require("mongoose");

const ProfileSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true
    },
    address: {
        type: String,
        required: true
    },
    phoneNumber1: {
        type: String,
        required: true
    },
    phoneNumber2: {
        type: String,
        required: true
    },
    receiptText: {
        type: String,
        required: true
    },
})

module.exports = mongoose.model('Profile', ProfileSchema);
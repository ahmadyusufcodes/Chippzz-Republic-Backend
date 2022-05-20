const mongoose = require("mongoose");

const CompanyDetails = new mongoose.Schema({
    name: {
        type: String,
        required: true
    },
    phoneNumbers: {
        type: Array(String),
        required: true
    },
    address: {
        type: String,
        required: true
    },
    VAT: {
        type: Number,
        required: true
    },
    
})

module.exports = mongoose.model('CompanyDetails', CompanyDetails);
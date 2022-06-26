const mongoose = require("mongoose");
const BranchSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true
    },
    address: {
        type: String,
        required: true
    },
    phone: {
        type: String,
        required: true
    },
    phone1: {
        type: String,
        required: true
    },
    email: {
        type: String,
        required: true
    },
    owner: {
        type: String,
        required: true
    },
    createdAt: {
        type: Date,
        default: Date.now
    },
})
BranchSchema.pre('save', function(next) {
    const branch = this;
    if(!branch.$isDefault('updatedAt')){
        branch.updatedAt = new Date().toISOString()
    }
    next()
})

module.exports = mongoose.model('Branch', BranchSchema);


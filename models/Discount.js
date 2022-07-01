const mongoose = require("mongoose");
const DiscountSchema = new mongoose.Schema({
    title: {
        type: String,
        required: true
    },
    percentage: {
        type: Number,
        default: 0
    },
})

module.exports = mongoose.model('Discount', DiscountSchema);


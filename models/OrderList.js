const mongoose = require("mongoose");
const Product = require("./Product");
const User = require("./User");

const OrderListSchema = new mongoose.Schema({
    items: {
        type: Product,
        required: true
    },
    qty: {
        type: Number,
        required: true,
        default: 1
    },
})

module.exports = mongoose.model('OrderList', OrderListSchema);
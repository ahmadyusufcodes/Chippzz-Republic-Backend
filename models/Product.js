const mongoose = require("mongoose");
const Category = require("./Category");

const ProductSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true
    },
    category: {
        type: String,
        required: true
    },
    stock: {
        type: Number,
        default: 1
    },
    stockSold: {
        type: Number,
        default: 0
    },
    price: {
        type: Number,
        required: [true, "Price must be included"]
    }
})

module.exports = mongoose.model('Product', ProductSchema);
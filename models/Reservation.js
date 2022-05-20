const mongoose = require("mongoose");
const User = require("./User");

const OrderSchema = new mongoose.Schema({
    items: {
        type: Array({item: Object, qty: {type: Number}}),
        required: true
    },
    customer: {
        type: String,
        required: true
    },
    orderType: {
        type: String,
        enum: ["Shipment", "Instant-Order", "Reservation"],
        default: "Instant-Order"
    },
    reservationDate: {
        type: Date
    },
    receiptNo: {
        type: Number,
    },
    createdAt: {
        type: Date,
        default: Date.now()
    },
    createdBy: {
        type: String,
        required: true
    },
    revoked: {
        type: Boolean,
        default: false
    }
})

OrderSchema.pre('save', function(next) {
    const Product = require("./Product")
    const order = this;
    if(!order.$isDefault('revoked')){
        order.items.forEach(async(item) => {
            return await Product.findOneAndUpdate({_id: item.item._id}, {$inc: {stock: item.qty}})
        })
        next()
    }
    order.items.forEach(async(item) => {
        return await Product.findOneAndUpdate({_id: item.item._id}, {$inc: {stock: - item.qty}})
    })
    next()
});


module.exports = mongoose.model('Order', OrderSchema);
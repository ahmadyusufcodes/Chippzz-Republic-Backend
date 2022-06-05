const mongoose = require("mongoose");

const D = new Date().toLocaleString('en-US', {
    timeZone: 'Africa/Lagos'
    })
    
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
    reservationFulfilled: {
        type: Boolean,
        default: false
    },
    reservationFulfilledOn: {
        type: Date
    },
    isReserved: {
        type: Boolean,
        default: false
    },
    receiptNo: {
        type: Number,
    },
    createdAt: {
        type: Date,
        default: D
    },
    createdBy: {
        type: String,
        required: true
    },
    shipmentFee: {
        type: Number
    },
    revoked: {
        type: Boolean,
        default: false
    }
})
OrderSchema.pre('save', function(next) {
    const Product = require("./Product")
    const order = this;

    if(order.isNew && order.isReserved){
        return next()
    }
    
    if(!order.isNew && order.isReserved && !order.$isDefault("reservationFulfilled")){
        order.items.forEach(async(item) => {
            return await Product.findOneAndUpdate({_id: item.item._id}, {$inc: {stock: - item.qty}})
        })
        this.reservationFulfilledOn = new Date().toISOString()
        return next()
    }
    
    if(order.orderType === "Reservation" && !order.$isDefault('revoked')){
        console.log("Revoke Reservation")
        return next()
    }
    

    if(!order.$isDefault('revoked')){
        order.items.forEach(async(item) => {
            return await Product.findOneAndUpdate({_id: item.item._id}, {$inc: {stock: item.qty}})
        })
        return next()
    }
    order.items.forEach(async(item) => {
        return await Product.findOneAndUpdate({_id: item.item._id}, {$inc: {stock: - item.qty}})
    })
    next()
});


module.exports = mongoose.model('Order', OrderSchema);

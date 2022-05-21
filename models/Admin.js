const mongoose = require("mongoose")
const bcrypt = require("bcrypt")

const AdminSchema = new mongoose.Schema({
    username: {
        type: String,
        required: true,
    },
    firstName: {
        type: String,
        required: true
    },
    lastName: {
        type: String,
        required: true
    },
    password: {
        type: String,
        required: true
    },
    role: {
        type: String,
        default: "Admin"
    }
})

AdminSchema.pre('save',  function(next) {
    const admin = this
    if (!admin.isModified('password')) return next()

    bcrypt.genSalt(10, (err, salt) => {
        if (err) return next(err)
        bcrypt.hash(admin.password, salt, (err, hash) => {
            if (err) return next(err)
            admin.password = hash
            next()
        })
    });
});

AdminSchema.methods.comparePassword = function(password) {
    return bcrypt.compareSync(password, this.password)
};

module.exports = mongoose.model('Admin', AdminSchema)
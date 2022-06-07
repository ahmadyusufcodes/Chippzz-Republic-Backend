const mongoose = require("mongoose")
const bcrypt = require("bcrypt")

const UserSchema = new mongoose.Schema({
    username: {
        type: String,
        required: [true, "Firstname is required"]
    },
    firstName: {
        type: String,
        required: [true, "Firstname is required"]
    },
    lastName: {
        type: String,
        required: [true, "Lastname is required"]
    },
    phone: {
        type: String
        // type: isMobilePhone(isMobilePhoneLocales) 
    },
    password: {
        type: String,
        required: [true, "Password must be included"],

    },
    disabled: {
        type: Boolean,
        default: false

    },
    role: {
        type: String,
        default: "Staff"
    }
})

UserSchema.pre('save',  function(next) {
    const user = this;
    if (!user.isModified('password')) return next();

    bcrypt.genSalt(10, function(err, salt) {
        if (err) return next(err);

        bcrypt.hash(user.password, salt, (err, hash) => {
            if (err) return next(err);
            user.password = hash;
            next();
        });
    });
});


UserSchema.methods.hashPassword = (password) => {
    bcrypt.genSalt(10, function(err, salt) {
        if (err) return err;
        bcrypt.hash(password, salt, (err, hash) => {
            if (err) return next(err);
            // password = hash;
            console.log(hash)
            return hash
        });
    });
}


UserSchema.methods.comparePassword = function(password) {
    return bcrypt.compareSync(password, this.password);
};

module.exports = mongoose.model('User', UserSchema);
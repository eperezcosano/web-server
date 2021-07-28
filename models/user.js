const mongoose = require('mongoose')

const userSchema = new mongoose.Schema({
    email: {
        type: String,
        required: true,
        unique: true
    },
    uname: {
        type: String,
        required: true
    },
    rol: {
        type: String,
        default: 'Member'
    },
    ip: {
        type: String,
        required: true
    },
    clientIP: {
        type: String,
        required: false
    },
    activation: {
        type: Boolean,
        default: false
    },
    digest: {
        type: String,
        required: true
    },
    salt: {
        type: String,
        required: true
    }
},
    { timestamps: true }
)

module.exports = mongoose.model('User', userSchema)

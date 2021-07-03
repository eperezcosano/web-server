const mongoose = require('mongoose')

const loginAttempt = new mongoose.Schema({
        user_id: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
            required: true,
        },
        ip: {
            type: String,
            required: true
        },
        success: {
            type: Boolean,
            default: false
        }
    },
    {timestamps: true}
)

module.exports = mongoose.model('LoginAttempt', loginAttempt)

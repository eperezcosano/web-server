const mongoose = require('mongoose')

const invitationSchema = new mongoose.Schema({
    referral: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
    },
    email: {
        type: String,
        required: true
    },
    date: {
        type: Date,
        required: true
    }
})

module.exports = mongoose.model('Invitation', invitationSchema)

const mongoose = require('mongoose')

const activationSchema = new mongoose.Schema({
        email: {
            type: String,
            required: true
        },
        code: {
            type: String,
            required: true
        }
    },
    {timestamps: true}
)

module.exports = mongoose.model('Activation', activationSchema)

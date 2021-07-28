const mongoose = require('mongoose')

const torrentSchema = new mongoose.Schema({
        infoHash: {
            type: String,
            required: true
        },
        name: {
            type: String,
            required: true
        },
        description: {
            type: String,
            required: false
        },
        file: {
            type: String,
            required: true
        },
        length: {
            type: Number,
            required: true
        },
        owner: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
            required: true,
        }
    },
    {timestamps: true}
)

module.exports = mongoose.model('Torrent', torrentSchema)

const mongoose = require('mongoose')

const torrentSchema = new mongoose.Schema({
        infoHash: {
            type: String,
            required: true,
            unique: true
        },
        name: {
            type: String,
            required: true
        },
        title: {
            type: String,
            required: false
        },
        description: {
            type: String,
            required: false
        },
        file: {
            type: Buffer,
            required: true
        },
        length: {
            type: Number,
            required: true
        },
        uploaded: {
            type: Number,
            default: 0
        },
        downloaded: {
            type: Number,
            default: 0
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

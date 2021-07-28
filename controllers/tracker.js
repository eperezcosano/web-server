const mongoose = require("mongoose")
require('../models/user')
const User = mongoose.model('User')
require('../models/torrent')
const Torrent = mongoose.model('Torrent')

async function checkTorrent(infoHash, params, cb) {
    try {
        const torrent = await Torrent.findOne({"infoHash": infoHash})
        if (!torrent) {
            cb(new Error('Torrent denied'))
        }
        const ip = await User.findOne({"ip": params.ip})
        if (!ip) {
            cb(new Error('IP not whitelisted'))
        }
        console.log('OK', params)
        cb(null)
    } catch (err) {
        cb(new Error('Internal error'))
    }
}

module.exports = {checkTorrent}

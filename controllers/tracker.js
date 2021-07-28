const mongoose = require("mongoose")
require('../models/user')
const User = mongoose.model('User')
require('../models/torrent')
const jwt = require("jsonwebtoken");
const {trackerSecret} = require("../config");
const Torrent = mongoose.model('Torrent')

async function checkTorrent(infoHash, params, cb) {

    const token = params.k
    if (!token) {
        return cb(new Error('Unauthorised.'))
    }
    try {
        const payload = jwt.verify(token, trackerSecret)

        if (payload.torrent !== infoHash) {
            return cb(new Error('Torrent not registered.'))
        }

        const torrent = await Torrent.findOne({"infoHash": infoHash})
        if (!torrent) {
            return cb(new Error('Torrent not registered.'))
        }
        //TODO: update torrent stats and user

        const query = await User.updateOne({"_id": payload.id}, {"clientIP": params.ip})
        if (query.ok !== 1) {
            return cb(new Error('Unauthorised.'))
        }

        return cb(null)

    } catch (err) {
        console.log(err)
        return cb(new Error('Unauthorised.'))
    }
}

module.exports = {checkTorrent}

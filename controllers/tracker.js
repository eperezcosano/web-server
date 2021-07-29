const mongoose = require("mongoose")
require('../models/user')
const User = mongoose.model('User')
require('../models/torrent')
const jwt = require("jsonwebtoken");
const {trackerSecret} = require("../config");
const Torrent = mongoose.model('Torrent')

async function checkTorrent(infoHash, params, cb) {
    console.log('------------------------------')
    console.log('addr', params.addr)
    console.log('k', params.k)
    console.log('uploaded', params.uploaded)
    console.log('downloaded', params.downloaded)
    console.log('left', params.left)
    console.log('info_hash', params.info_hash.slice(params.info_hash - 5))
    console.log('peer_id', params.peer_id.slice(params.peer_id - 5))
    console.log('type', params.type)
    console.log('------------------------------')
    const token = params.k
    if (!token) {
        return cb(new Error('Unauthorised (1)'))
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
            return cb(new Error('Unauthorised (2)'))
        }

        return cb(null)

    } catch (err) {
        console.log(err)
        return cb(new Error('Unauthorised (3)'))
    }
}

module.exports = {checkTorrent}

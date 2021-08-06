const mongoose = require("mongoose")
const trackerServer = require('bittorrent-tracker').Server
require('../models/user')
const User = mongoose.model('User')
require('../models/torrent')
const jwt = require("jsonwebtoken")
const {trackerSecret} = require("../config")
const Torrent = mongoose.model('Torrent')

class PrivateTracker {

    trackerPort = 8000
    hostname = {
        http: '::',
        udp4: '0.0.0.0',
        udp6: '::'
    }

    constructor() {
        this.tracker = new trackerServer({
            http: true,
            interval: 60000,
            stats: false,
            trustProxy: true,
            udp: false,
            ws: true,
            filter: async function (infoHash, params, cb) {
                console.log(params)
                console.log('------------------------------')
                console.log('addr', params.addr)
                console.log('k', params.k)
                console.log('uploaded', params.uploaded)
                console.log('downloaded', params.downloaded)
                console.log('left', params.left)
                console.log('info_hash', params.info_hash)
                console.log('peer_id', params.peer_id)
                console.log('type', params.type)
                console.log('------------------------------')

                const token = params.k
                if (!token) {
                    return cb(new Error('Unauthorised (1)'))
                }
                try {
                    const payload = jwt.verify(token, trackerSecret)

                    if (payload.torrent !== infoHash) {
                        return cb(new Error('Torrent not registered (1)'))
                    }

                    const updateTorrent = await Torrent.updateOne(
                        {"infoHash": infoHash},
                        {
                            $inc: {uploaded: params.uploaded, downloaded: params.downloaded}
                        })
                    if (updateTorrent.ok !== 1) {
                        return cb(new Error('Torrent not registered (2)'))
                    }

                    const updateUser = await User.updateOne(
                        {"_id": payload.id},
                        {
                            $set: {"clientIP": params.ip},
                            $inc: {uploaded: params.uploaded, downloaded: params.downloaded}
                        })
                    if (updateUser.ok !== 1) {
                        return cb(new Error('Unauthorised (2)'))
                    }

                    return cb(null)

                } catch (err) {
                    console.log(err)
                    return cb(new Error('Unauthorised (3)'))
                }
            }
        })
        this.tracker.on('error', err => {
            console.error(`ERROR: ${err.message}`)
        })
        this.tracker.on('warning', err => {
            console.log(`WARNING: ${err.message}`)
        })
        this.tracker.on('update', addr => {
            console.log(`update: ${addr}`)
        })
        this.tracker.on('complete', addr => {
            console.log(`complete: ${addr}`)
        })
        this.tracker.on('start', addr => {
            console.log(`start: ${addr}`)
        })
        this.tracker.on('stop', addr => {
            console.log(`stop: ${addr}`)
        })
        this.tracker.listen(this.trackerPort, this.hostname, () => {
            console.log('Tracker online')
        })
    }

    get serverTracker() {
        return this.tracker
    }
}

class Tracker {

    constructor() {
        if (!Tracker.instance) {
            Tracker.instance = new PrivateTracker()
        }
    }

    getInstance() {
        return Tracker.instance;
    }
}

module.exports = Tracker

const mongoose = require("mongoose")
require('../models/user')
const User = mongoose.model('User')
require('../models/invitation')
const Invitation = mongoose.model('Invitation')
require('../models/login_attempt')
const LoginAttempt = mongoose.model('LoginAttempt')
require('../models/torrent')
const Torrent = mongoose.model('Torrent')
const nodemailer = require('nodemailer')
const {gmailUser, gmailPass, trackerSecret} = require("../config")
const parseTorrent = require('parse-torrent')
const jwt = require("jsonwebtoken")
const Tracker = require('./tracker')

const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: gmailUser,
        pass: gmailPass
    }
})

function countPeers (filterFunction, allPeers) {
    const hasOwnProperty = Object.prototype.hasOwnProperty
    let count = 0
    let key

    for (key in allPeers) {
        if (hasOwnProperty.call(allPeers, key) && filterFunction(allPeers[key])) {
            count++
        }
    }

    return count
}

function getStats(server) {
    const infoHashes = Object.keys(server.torrents)
    const hasOwnProperty = Object.prototype.hasOwnProperty
    let activeTorrents = 0
    const allPeers = {}
    infoHashes.forEach(infoHash => {
        const peers = server.torrents[infoHash].peers
        const keys = peers.keys
        if (keys.length > 0) activeTorrents++

        keys.forEach(peerId => {
            // Don't mark the peer as most recently used for stats
            const peer = peers.peek(peerId)
            if (peer == null) return // peers.peek() can evict the peer

            if (!hasOwnProperty.call(allPeers, peerId)) {
                allPeers[peerId] = {
                    ipv4: false,
                    ipv6: false,
                    seeder: false,
                    leecher: false
                }
            }

            if (peer.ip.includes(':')) {
                allPeers[peerId].ipv6 = true
            } else {
                allPeers[peerId].ipv4 = true
            }

            if (peer.complete) {
                allPeers[peerId].seeder = true
            } else {
                allPeers[peerId].leecher = true
            }

            allPeers[peerId].peerId = peer.peerId
        })
    })

    const isSeeder = peer => peer.seeder === true
    const isLeecher = peer => peer.leecher === true
    const isIPv4 = peer => peer.ipv4
    const isIPv6 = peer => peer.ipv6

    const peersSeeders = countPeers(isSeeder, allPeers)
    const peersLeechers = countPeers(isLeecher, allPeers)
    const ratio = (peersSeeders === 0 && peersLeechers === 0) ? 0 : Math.round(((peersSeeders / peersLeechers) + Number.EPSILON) * 1000) / 1000

    return {
        activeTorrents,
        peersAll: Object.keys(allPeers).length,
        peersSeeders,
        peersLeechers,
        ratio,
        peersIPv4: countPeers(isIPv4, allPeers),
        peersIPv6: countPeers(isIPv6, allPeers),
    }
}

async function home(req, res) {
    const page = req.params.page ? req.params.page : 1
    const itemsPerPage = 25
    const totalUsers = await User.countDocuments()
    const totalTorrents = await Torrent.countDocuments()
    const torrents = await Torrent.find().sort({createdAt: -1}).skip((page - 1) * itemsPerPage).limit(itemsPerPage).populate('owner')
    const traffic = await User.aggregate([{
        $group: {
            _id: '',
            uploaded: {$sum: '$uploaded'},
            downloaded: {$sum: '$downloaded'}
            }
        }, {
        $project: {
            _id: 0,
            traffic: { $add: ['$uploaded', '$downloaded']}
            }
        }
    ])
    const server = new Tracker().getInstance().serverTracker
    const stats = {...{totalUsers, totalTorrents, traffic: prettyBytes(traffic[0].traffic)}, ...getStats(server)}
    const torrentTable = torrents.map(torrent => {
        let res = {}
        res.infoHash = torrent.infoHash
        res.name = torrent.title ? torrent.title : torrent.name
        res.files = torrent.files
        res.downloads = Math.round(torrent.downloaded / torrent.length)
        res.length = prettyBytes(torrent.length)
        res.seeders = server.torrents[torrent.infoHash] ? server.torrents[torrent.infoHash].complete : 0
        res.leechers = server.torrents[torrent.infoHash] ? server.torrents[torrent.infoHash].incomplete : 0
        res.owner = torrent.owner.uname
        res.date = torrent.createdAt.toLocaleString("en-GB", {
            year: "numeric",
            month: "short",
            day: "2-digit",
            hour: "2-digit",
            minute: "2-digit"
        })
        return res
    })
    res.render('home', {payload: req.payload, stats, torrents: torrentTable, page})
}

function logout(req, res) {
    return res.clearCookie('token').render('index')
}

function prettyBytes(num) {
    let exponent, unit, neg = num < 0, units = ['B', 'kB', 'MB', 'GB', 'TB', 'PB', 'EB', 'ZB', 'YB']
    if (neg) num = -num
    if (num < 1) return (neg ? '-' : '') + num + ' B'
    exponent = Math.min(Math.floor(Math.log(num) / Math.log(1000)), units.length - 1)
    num = Number((num / Math.pow(1000, exponent)).toFixed(2))
    unit = units[exponent]
    return (neg ? '-' : '') + num + ' ' + unit
}

async function userProfile(req, res) {
    try {
        const user = await User.findOne({"uname": req.params.uname})
        if (user) {
            const invitations = await Invitation.find({"referral": user._id })
            const attempts = await LoginAttempt.find({"user_id": user._id}).sort({createdAt: -1})
            const ratio = (user.uploaded === 0 && user.downloaded === 0) ? 0 : Math.round(((user.uploaded / user.downloaded) + Number.EPSILON) * 1000) / 1000
            return res.render('home', { payload: req.payload, user, up: prettyBytes(user.uploaded), down: prettyBytes(user.downloaded), ratio, invitations, attempts })
        } else {
            return res.render('home', { payload: req.payload, alert: { type: 'error', msg: 'User not found' }})
        }
    } catch (err) {
        // Database error
        console.error(err)
        return res.status(500).render('home', { payload: req.payload, alert: { type: 'warning', msg: 'Internal error. Please try again later...'} })
    }
}

async function invite(req, res) {
    try {
        if (req.payload.rol !== 'Admin') {
            return res.render('home', { payload: req.payload, alert: { type: 'error', msg: 'You do not have permissions.'} })
        }
        const email = req.body.destEmail
        const msg = req.body.msg ? 'Message: ' + req.body.msg : ''
        const isInvited = await Invitation.countDocuments({"email": email})

        if (isInvited > 0) {
            return res.render('home', { payload: req.payload, alert: { type: 'error', msg: 'User already invited.'} })
        }

        const invitation = new Invitation({
            referral: req.payload.id,
            email: email
        })

        // Send email
        const mailOptions = {
            from: '"Lufo" <' + gmailUser + '>',
            to: email,
            subject: 'Invitation to Lufo',
            text: 'Hello, you have received an invitation to Lufo! https://lufo.ml/',
            html: "Hello, you have received an invitation to Lufo!<br>" +
                "You have been invited by: <b>" + req.payload.uname + "</b><br>" +
                msg + "<br>" +
                "<a href='https://lufo.ml/'>https://lufo.ml/</a>"
        }
        await transporter.sendMail(mailOptions)

        // Save it in the database
        await invitation.save()

        return res.render('home', {payload: req.payload, alert: { type: 'success', msg: 'Invitation sent.'} })

    } catch (err) {
        // Database error
        console.error(err)
        return res.status(500).render('home', { payload: req.payload, alert: { type: 'warning', msg: 'Internal error. Please try again later...'} })
    }
}

function addTorrentPage(req, res) {
    return res.render('home', {payload: req.payload, add: true })
}

async function addTorrent(req, res) {
    try {

        if (!req.files || Object.keys(req.files).length === 0) {
            return res.status(400).render('home', {
                payload: req.payload,
                add: true,
                alert: {type: 'error', msg: 'No files were uploaded.'}
            })
        }

        const tFile = req.files.file

        if (tFile.size > 102400 || tFile.mimetype !== 'application/x-bittorrent') {
            return res.status(400).render('home', {
                payload: req.payload,
                add: true,
                alert: {type: 'error', msg: 'Invalid file.'}
            })
        }

        let torrent = parseTorrent(tFile.data)

        const torrentExists = await Torrent.exists({"infoHash": torrent.infoHash})
        if (torrentExists) {
            return res.render('home', {
                payload: req.payload,
                add: torrent.infoHash,
                alert: {type: 'info', msg: 'Torrent is already registered.'}
            })
        }

        torrent.private = true
        torrent.info.private = 1
        torrent.announce = []
        torrent.comment = 'Private torrent from Lufo.ml'
        torrent.createdBy = req.payload.uname
        torrent.created = new Date()

        const title = req.body.title
        const desc = req.body.desc
        const buffer = parseTorrent.toTorrentFile(torrent)

        const instance = new Torrent({
            infoHash: torrent.infoHash,
            name: torrent.name,
            title: title,
            description: desc,
            files: torrent.files.length,
            file: buffer,
            length: torrent.length,
            owner: req.payload.id
        })

        const collection = await instance.save()

        return res.status(201).render('home', { payload: req.payload, add: collection.infoHash, alert: { type: 'success', msg: 'Torrent registered successfully.'}})

    } catch (err) {
        console.error(err)
        return res.status(500).render('home', { payload: req.payload, add: true, alert: { type: 'warning', msg: 'Internal error. Please try again later...'} })
    }
}

async function player(req, res) {
    const infoHash = req.params.infoHash
    res.render('home', {payload: req.payload, view: infoHash})
}

async function downloadTorrent(req, res) {
    try {
        const infoHash = req.params.infoHash
        const doc = await Torrent.findOne({"infoHash": infoHash})
        if (!doc) {
            return res.render('home', { payload: req.payload, alert: { type: 'error', msg: 'Torrent not found' }})
        }

        let torrent = parseTorrent(doc.file)
        const token = jwt.sign({ id: req.payload.id, torrent: torrent.infoHash }, trackerSecret)
        torrent.private = true
        torrent.info.private = 1
        torrent.announce = [
            'wss://lufo.ml/ws',
            'https://lufo.ml/announce?k=' + token
        ]
        const buffer = parseTorrent.toTorrentFile(torrent)

        res.cookie('k', token, { maxAge: 5 * 3600 * 1000, httpOnly: true, secure: true})
        res.setHeader('Content-disposition', 'attachment; filename=' + torrent.name + '.torrent')
        res.setHeader('Content-type', 'application/x-bittorrent')
        res.end(buffer)

    } catch (err) {
        console.error(err)
        return res.status(500).render('home', { payload: req.payload, alert: { type: 'warning', msg: 'Internal error. Please try again later...'} })
    }
}

module.exports = {
    home,
    logout,
    userProfile,
    invite,
    addTorrentPage,
    addTorrent,
    downloadTorrent,
    player
}

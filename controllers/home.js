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

const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: gmailUser,
        pass: gmailPass
    }
})


async function home(req, res) {
    const totalUsers = await User.countDocuments()
    const totalTorrents = await Torrent.countDocuments()
    const torrents= await Torrent.find()
    const stats = {totalUsers, totalTorrents}
    res.render('home', {payload: req.payload, stats, torrents})
}

function logout(req, res) {
    return res.clearCookie('token').render('index')
}

async function userProfile(req, res) {
    try {
        const user = await User.findOne({"uname": req.params.uname})
        if (user) {
            const invitations = await Invitation.find({"referral": user._id })
            const attempts = await LoginAttempt.find({"user_id": user._id}).sort({createdAt: -1})
            return res.render('home', { payload: req.payload, user, invitations, attempts })
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
            file: buffer,
            length: torrent.length,
            owner: req.payload.id
        })

        const collection = await instance.save()

        return res.status(201).render('home', { payload: req.payload, add: collection._id, alert: { type: 'success', msg: 'Torrent registered successfully.'}})

    } catch (err) {
        console.error(err)
        return res.status(500).render('home', { payload: req.payload, add: true, alert: { type: 'warning', msg: 'Internal error. Please try again later...'} })
    }
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
        torrent.announce = ['http://lufo.ml:8000/announce?k=' + token] //, 'ws://lufo.ml:8000']
        const buffer = parseTorrent.toTorrentFile(torrent)

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
    downloadTorrent
}

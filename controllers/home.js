const mongoose = require("mongoose")
require('../models/user')
const User = mongoose.model('User')
require('../models/invitation')
const Invitation = mongoose.model('Invitation')
require('../models/login_attempt')
const LoginAttempt = mongoose.model('LoginAttempt')
const nodemailer = require('nodemailer')
const {gmailUser, gmailPass} = require("../config")
const parseTorrent = require('parse-torrent')
const fs = require('fs')
const {parse} = require("nunjucks/src/parser");
const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: gmailUser,
        pass: gmailPass
    }
})


function home(req, res) {
    res.render('home', {payload: req.payload})
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

function addTorrent(req, res) {
    if (!req.files || Object.keys(req.files).length === 0) {
        return res.status(400).render('home', {payload: req.payload, add: true, alert: { type: 'error', msg: 'No files were uploaded.'}})
    }

    console.log(req.files.file)
    const tFile = req.files.file

    if (tFile.size > 102400 || tFile.mimetype !== 'application/x-bittorrent') {
        //fs.unlinkSync(tFile.tempFilePath)
        return res.status(400).render('home', {payload: req.payload, add: true, alert: { type: 'error', msg: 'Invalid file.'}})
    }

    const name = req.body.name ? req.body.name : tFile.name
    const desc = req.body.desc
    const torrentConfig = {
        name: name,
        comment: 'Private torrent from Lufo.ml',
        createdBy: req.payload.uname,
        private: true,
        announceList: [['udp://lufo.ml:8000'], ['ws://lufo.ml:8000']]
        //info: 'this is a test'
    }

    let torrent = parseTorrent(tFile.data)
    torrent.private = true
    torrent.announce = ['udp://lufo.ml:8000', 'ws://lufo.ml:8000']
    torrent.comment = 'Private torrent from Lufo.ml'
    torrent.createdBy = req.payload.uname
    torrent.created = new Date()

    return res.download(parseTorrent.toTorrentFile(torrent), name)
}

module.exports = {
    home,
    logout,
    userProfile,
    invite,
    addTorrentPage,
    addTorrent
}

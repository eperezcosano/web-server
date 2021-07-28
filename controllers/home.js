const mongoose = require("mongoose")
require('../models/user')
const User = mongoose.model('User')
require('../models/invitation')
const Invitation = mongoose.model('Invitation')
require('../models/login_attempt')
const LoginAttempt = mongoose.model('LoginAttempt')
const nodemailer = require('nodemailer')
const {gmailUser, gmailPass} = require("../config")
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
            invitations.map( item => {
                item.accepted = User.find({"email": item.email}, {"activation": 1})
                return item
            })
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

module.exports = {
    home,
    logout,
    userProfile,
    invite
}

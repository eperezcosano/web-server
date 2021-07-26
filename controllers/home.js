const mongoose = require("mongoose")
require('../models/user')
const User = mongoose.model('User')
require('../models/invitation')
const Invitation = mongoose.model('Invitation')
require('../models/login_attempt')
const LoginAttempt = mongoose.model('LoginAttempt')

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
            const attempts = await LoginAttempt.find({"user_id": user._id})
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

module.exports = {
    home,
    logout,
    userProfile
}

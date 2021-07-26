const mongoose = require("mongoose")
require('../models/user')
const User = mongoose.model('User')

function home(req, res) {
    res.render('home', {payload: req.payload})
}

function logout(req, res) {
    return res.clearCookie('token').render('index')
}

async function userProfile(req, res) {
    try {
        const user = await User.findOne({"uname": req.params.uname})
        return res.render('home', { payload: req.payload, user })
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

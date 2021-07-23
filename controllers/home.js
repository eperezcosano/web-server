function logout(req, res) {
    return res.clearCookie('token').render('index')
}

async function userProfile(req, res) {
    try {
        return res.render('home', { alert: {type: 'info', msg: req.param.uname }})
    } catch (err) {
        // Database error
        console.error(err)
        return res.status(500).render('home', { alert: { type: 'warning', msg: 'Internal error. Please try again later...'} })
    }
}

module.exports = {
    logout,
    userProfile
}

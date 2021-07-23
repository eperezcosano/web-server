function home(req, res) {
    res.render('home', {payload: req.payload})
}

function logout(req, res) {
    return res.clearCookie('token').render('index')
}

async function userProfile(req, res) {
    try {
        return res.render('home', { payload: req.payload, alert: {type: 'info', msg: req.params.uname }})
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

function logout(req, res) {
    return res.clearCookie('token').render('index')
}

module.exports = {
    logout
}

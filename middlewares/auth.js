const jwt = require('jsonwebtoken')
const { jwtSecret } = require('../config')

function verifyToken(req, res, next) {

    const token = req.cookies.token
    if (!token) {
        return next()
    }
    let payload
    try {
        payload = jwt.verify(token, jwtSecret)
        res.render('home', {payload})
    } catch (e) {
        next()
    }
}

module.exports = {verifyToken}

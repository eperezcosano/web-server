const jwt = require('jsonwebtoken')
const { jwtSecret } = require('../config')

function verifyToken(req, res, next) {
    const token = req.cookies.token
    if (!token) {
        return res.render('index')
    }
    try {
        req.payload = jwt.verify(token, jwtSecret)
        next()
    } catch (e) {
        return res.render('index')
    }
}

module.exports = {verifyToken}

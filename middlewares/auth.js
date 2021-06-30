const jwt = require('jsonwebtoken')
const path = require('path')
const fs = require('fs')

function verifyToken(req, res, next) {

    const token = req.cookies.token
    if (!token) {
        return next()
    }
    let payload
    try {
        const secret = fs.readFileSync(path.join(__dirname, '/../certs/jwt-secret.txt'), 'ascii')
            .split('--')[0]
        payload = jwt.verify(token, secret)
        res.render('home', {payload})
    } catch (e) {
        next()
    }
}

module.exports = {verifyToken}

const https = require('https')
const querystring = require('querystring')
const { hCaptchaSecret } = require('../config')

function verify(req, res, next) {
    if (!req.body || !req.body['h-captcha-response']) {
        // console.log('No body')
        req.hcaptcha = false
        return next()
    }
    const token = req.body['h-captcha-response']
    const secret = hCaptchaSecret
    const data = querystring.stringify({secret, response: token})
    const options = {
        hostname: 'hcaptcha.com',
        port: 443,
        path: '/siteverify',
        method: 'POST',
        headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
            'Content-Length': Buffer.byteLength(data)
        }
    }
    const request = https.request(options, response => {
        response.setEncoding('utf8')
        let buffer = ''
        response
            .on('error', () => {
                // console.log('Req error')
                req.hcaptcha = false
                return next()
            })
            .on('data', (chunk) => buffer += chunk)
            .on('end', () => {
                // console.log(JSON.parse(buffer))
                req.hcaptcha = JSON.parse(buffer).success
                return next()
            })
        res.on('data', d => {
            process.stdout.write(d)
        })
    })
    request.on('error', () => {
        // console.log('Req error')
        req.hcaptcha = false
        return next()
    })
    request.write(data)
    request.end()
}

module.exports = {verify}

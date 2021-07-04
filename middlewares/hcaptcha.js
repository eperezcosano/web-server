const https = require('https')
const querystring = require('querystring')

function verify(req, res, next) {
    if (!req.body || !req.body.h-captcha-response) {
        console.log('No body')
        return next()
    }
    const token = req.body.h-captcha-response
    const secret = '0xDa2C1F0c71116Fc349B668C893d4B7dA1370F307'
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
            .on('error', () => { console.log('Req error'); next()})
            .on('data', (chunk) => buffer += chunk)
            .on('end', () => {
                console.log('End')
                req.hcaptcha = JSON.parse(buffer)
                next()
            })
        res.on('data', d => {
            process.stdout.write(d)
        })
    })
    request.on('error', () => { console.log('Req error'); next()})
    request.write(data)
    request.end()
}

module.exports = {verify}

/*
* TODO: Email, invitations, certbot, captcha, attempts, webtorrent
* */
const express = require('express')
const https = require('https')
const fs = require('fs')
const nunjucks = require('nunjucks')
const mongoose = require('mongoose')
const cookieParser = require('cookie-parser')

const port = 3433
const MONGO_URI = 'mongodb://localhost/web-server';
const key = fs.readFileSync('./certs/localhost.decrypted.key')
const cert = fs.readFileSync('./certs/localhost.crt')

const app = express()
const server = https.createServer({key, cert}, app)
const router = require('./routes/index')

app.set('view engine', 'njk')
nunjucks.configure('views', {autoescape: true, express: app})
app.use(cookieParser())
app.use(express.json())
app.use(express.urlencoded({ extended: false }))
app.use(express.static('public'))
app.use('/', router)

mongoose.connect(MONGO_URI,
    {
        useNewUrlParser: true,
        useUnifiedTopology: true,
        useCreateIndex: true
    })
    .then(() => {
        console.log('Connected to DB');
    }).catch(error => {
    console.error('Connection to DB Failed');
    console.error(error.message);
    process.exit(-1);
})

server.listen(port, () => {
    console.log('Listening on https://localhost:' + port)
})

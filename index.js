const express = require('express')
const http = require('http')
const nunjucks = require('nunjucks')
const mongoose = require('mongoose')
const cookieParser = require('cookie-parser')
const fileUpload = require('express-fileupload')
const trackerServer = require('bittorrent-tracker').Server
const trackerController = require('./controllers/tracker')
const path = require('path')
const MONGO_URI = 'mongodb://localhost/web-server'
const port = 3000
const trackerPort = 8000
const hostname = {
    http: '::',
    udp4: '0.0.0.0',
    udp6: '::'
}

const app = express()
const server = http.createServer(app)
const router = require('./routes/index')

app.set('view engine', 'njk')
app.set('trust proxy', true)
nunjucks.configure('views', {autoescape: true, express: app})
app.use(cookieParser())
app.use(express.json())
app.use(express.urlencoded({ extended: false }))
app.use(fileUpload({
    useTempFiles: true,
    tempFileDir: path.join(__dirname,'tmp'),
    debug: true
}))
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

server.listen(port, 'localhost',() => {
    console.log('Listening on http://localhost:' + port)
})

// TODO: stats
// get info hashes for all torrents in the tracker server
//Object.keys(server.torrents)

// get the number of seeders for a particular torrent
//server.torrents[infoHash].complete

// get the number of leechers for a particular torrent
//server.torrents[infoHash].incomplete

// get the peers who are in a particular torrent swarm
//server.torrents[infoHash].peers

const tracker = new trackerServer({
    http: false,
    interval: 60000,
    stats: false,
    trustProxy: false,
    udp: true,
    ws: true,
    filter: trackerController.checkTorrent
})
tracker.on('error', err => {
    console.error(`ERROR: ${err.message}`)
})
tracker.on('warning', err => {
    console.log(`WARNING: ${err.message}`)
})
tracker.on('update', addr => {
    console.log(`update: ${addr}`)
})
tracker.on('complete', addr => {
    console.log(`complete: ${addr}`)
})
tracker.on('start', addr => {
    console.log(`start: ${addr}`)
})
tracker.on('stop', addr => {
    console.log(`stop: ${addr}`)
})
tracker.listen(trackerPort, hostname, () => {
    console.log('Tracker online')
})

const express = require('express')
const http = require('http')
const nunjucks = require('nunjucks')
const mongoose = require('mongoose')
const cookieParser = require('cookie-parser')
const Tracker = require('./controllers/tracker')
const MONGO_URI = 'mongodb://localhost/web-server'
const port = 3000

const app = express()
const server = http.createServer(app)
const router = require('./routes/index')

app.set('view engine', 'njk')
app.set('trust proxy', true)
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

server.listen(port, 'localhost',() => {
    console.log('Listening on http://localhost:' + port)
})

new Tracker()

// TODO: stats
// get info hashes for all torrents in the tracker server
//Object.keys(server.torrents)

// get the number of seeders for a particular torrent
//server.torrents[infoHash].complete

// get the number of leechers for a particular torrent
//server.torrents[infoHash].incomplete

// get the peers who are in a particular torrent swarm
//server.torrents[infoHash].peers


const express = require('express')
const http = require('http')
const nunjucks = require('nunjucks')
const mongoose = require('mongoose')
const cookieParser = require('cookie-parser')
const Tracker = require('./controllers/tracker')
const {db_usr, db_pwd, db_host, db_port, db} = require('./config')
const MONGO_URI = 'mongodb://'+db_usr+':'+db_pwd+'@'+db_host+':'+db_port+'/'+db+'?authSource=admin'
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
        useFindAndModify: false,
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


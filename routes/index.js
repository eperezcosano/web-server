const router = require('express').Router()
const indexController = require('../controllers/index')
const homeController = require('../controllers/home')
const validator = require('../middlewares/validator')
const auth = require('../middlewares/auth')
const hcaptcha = require('../middlewares/hcaptcha')
const { body, param } = require('express-validator')
const rateLimit = require('express-rate-limit')
const fileUpload = require("express-fileupload")
const path = require("path")

const limiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 100
})
const fileHandler = fileUpload({
    limits: { fileSize: 102400 },
    abortOnLimit: true
    /*
    safeFileNames: true,
    useTempFiles: false,
    tempFileDir: path.join(__dirname, '../tmp'),
    debug: false
    */
})
const resendLimiter = rateLimit({
    windowMs: 30 * 60 * 1000,
    max: 3,
    message: "Too many send requests, please try again later..."
})

// Index page
router.get('/', limiter, auth.verifyToken, homeController.home)
router.post('/',
    limiter,
    [
        body('email').isEmail().withMessage('Invalid email.').normalizeEmail()
    ],
    validator.index,
    indexController.identifyUser
)

// Registration page
router.post(
    '/register',
    limiter,
    [
        body('email').isEmail().withMessage('Invalid email.').normalizeEmail(),
        body('uname')
            .isAlphanumeric()
            .withMessage('Username must only contain letters and numbers.')
            .isLength({ min: 3, max: 30 })
            .withMessage('Invalid username length.'),
        body('pass')
            .isLength({min: 8})
            .withMessage('Minimum password length is 8.')
    ],
    validator.register,
    hcaptcha.verify,
    indexController.registerUser
)

// Login page
router.post('/login',
    limiter,
    [
        body('email').isEmail().withMessage('Invalid email.').normalizeEmail()
    ],
    hcaptcha.verify,
    validator.index,
    indexController.loginUser
)

// Activate account
router.get('/activate/:email/:code',
    limiter,
    [
        param('email').isEmail().withMessage('Invalid email.').normalizeEmail(),
    ],
    validator.index,
    indexController.loginUser
)

// Resend activation code
router.get('/resend/:email',
    resendLimiter,
    [
        param('email').isEmail().withMessage('Invalid email.').normalizeEmail(),
    ],
    validator.index,
    indexController.resendCode
)

// Logout
router.get('/logout',
    limiter,
    homeController.logout
)

// User profile
router.get('/user/:uname',
    limiter,
    auth.verifyToken,
    [
        param('uname').isAlphanumeric().withMessage('User not found.')
    ],
    validator.home,
    homeController.userProfile
)

// Invite
router.post('/invite', resendLimiter, auth.verifyToken, homeController.invite)

// Add torrent
router.get('/add', limiter, auth.verifyToken, homeController.addTorrentPage)
router.post('/add', limiter, auth.verifyToken, fileHandler, homeController.addTorrent)

// Download torrent
router.get('/torrent/:infoHash',
    limiter,
    auth.verifyToken,
    [
        param('infoHash').isLength({min: 24, max: 24}).isHexadecimal().withMessage('Torrent not found.')
    ],
    validator.home,
    homeController.downloadTorrent
)

module.exports = router;

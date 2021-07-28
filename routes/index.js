const router = require('express').Router()
const indexController = require('../controllers/index')
const homeController = require('../controllers/home')
const validator = require('../middlewares/validator')
const auth = require('../middlewares/auth')
const hcaptcha = require('../middlewares/hcaptcha')
const { body, param } = require('express-validator')
const rateLimit = require('express-rate-limit')
const limiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 100
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
        param('uname').isAlphanumeric()
    ],
    validator.home,
    homeController.userProfile
)

// Invite
router.post('/invite', resendLimiter, auth.verifyToken, homeController.invite)

// Add torrent
router.get('/add', limiter, auth.verifyToken, homeController.addTorrentPage)
router.post('/add', limiter, auth.verifyToken, homeController.addTorrent)

module.exports = router;

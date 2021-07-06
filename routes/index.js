const router = require('express').Router()
const indexController = require('../controllers/index')
const validator = require('../middlewares/validator')
const auth = require('../middlewares/auth')
const hcaptcha = require('../middlewares/hcaptcha')
const { body, param } = require('express-validator')
const rateLimit = require('express-rate-limit')
const limiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 100
})

// Index page
router.get('/', limiter, auth.verifyToken, indexController.getIndexPage)
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
    validator.index,
    hcaptcha.verify,
    indexController.registerUser
)

// Login page
router.post('/login',
    limiter,
    [
        body('email').isEmail().withMessage('Invalid email.').normalizeEmail(),
        body('pass').isLength({min: 8}).withMessage('Minimum length is 8.')
    ],
    validator.index,
    hcaptcha.verify,
    indexController.loginUser
)

//Activate account
router.get('/activate/:email/:code',
    limiter,
    [
        param('email').isEmail().withMessage('Invalid email.').normalizeEmail(),
    ],
    validator.index,
    indexController.loginUser
)

module.exports = router;

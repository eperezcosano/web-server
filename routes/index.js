const router = require('express').Router()
const indexController = require('../controllers/index')
const validator = require('../middlewares/validator')
const auth = require('../middlewares/auth')
const hcaptcha = require('../middlewares/hcaptcha')
const { body, param } = require('express-validator')

router.get('/', auth.verifyToken, indexController.getIndexPage)
router.post('/',
    [
        body('email')
            .isEmail()
            .withMessage('Invalid email.')
            .normalizeEmail()
    ],
    validator.index,
    indexController.identifyUser
)
router.get('/register', indexController.getRegistrationPage)
router.get('/register/:email',
    [
        param('email')
            .isEmail()
            .withMessage('Invalid email.')
            .normalizeEmail()
    ],
    auth.verifyToken,
    validator.index,
    indexController.getRegistrationPage
)
router.post(
    '/register',
    [
        body('email')
            .isEmail()
            .withMessage('Invalid email.')
            .normalizeEmail(),
        body('uname')
            .isAlphanumeric()
            .withMessage('Username must only contain letters and numbers.')
            .isLength({ min: 3, max: 30 })
            .withMessage('Invalid username length.'),
        body('pass')
            .isStrongPassword()
            .withMessage('Password is weak.')
    ],
    validator.index,
    hcaptcha.verify,
    indexController.registerUser
)
router.get('/login', indexController.getLoginPage)
router.get('/login/:email',
    [
        param('email')
            .isEmail()
            .withMessage('Invalid email.')
            .normalizeEmail()
    ],
    auth.verifyToken,
    validator.index,
    indexController.getLoginPage
)
router.post('/login',
    [
        body('email')
            .isEmail()
            .withMessage('Invalid email.')
            .normalizeEmail()
    ],
    validator.index,
    indexController.loginUser
)

module.exports = router;

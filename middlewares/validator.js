const { validationResult } = require('express-validator')

function index(req, res, next) {
    // Validate form fields
    //TODO: not working with activation and hcaptcha flags
    const errors = validationResult(req)
    if (req.path !== '/register' && req.path !== '/login' && !errors.isEmpty()) {
        const err = errors.array().reduce((obj, error) => Object.assign(obj, { [error.param]: error.msg }), {})
        return res.status(400).render('index', { errors: err })
    } else {
        next()
    }
}

module.exports = { index }

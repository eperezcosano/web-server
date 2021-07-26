const { validationResult } = require('express-validator')

function getErrors(errors) {
    if (!errors.isEmpty()) {
        return errors.array().reduce((obj, error) => Object.assign(obj, { [error.param]: error.msg }), {})
    } else {
        return null
    }
}

function index(req, res, next) {
    const errors = getErrors(validationResult(req))
    if (errors) {
        return res.status(400).render('index', {errors})
    } else {
        next()
    }
}

function register(req, res, next) {
    const errors = getErrors(validationResult(req))
    if (errors) {
        return res.status(400).render('index', {register: {email: req.body.email}, errors})
    } else {
        next()
    }
}

function home(req, res, next) {
    const errors = getErrors(validationResult(req))
    if (errors) {
        return res.render('home', { alert: { type: 'error', msg: 'User not found' }})
    } else {
        next()
    }
}

module.exports = {
    index,
    register,
    home
}

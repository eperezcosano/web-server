const { validationResult } = require('express-validator')

function getErrors(errors) {
    if (!errors.isEmpty()) {
        return errors.array().reduce((obj, error) => Object.assign(obj, { [error.param]: error.msg }), {})
    } else {
        return null
    }
}

function getAlertErrors(errors) {
    if (!errors.isEmpty()) {
        return Object.values(errors).join('\n')
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
        const alertErrors = getAlertErrors(errors)
        console.log(alertErrors)
        return res.status(400).render('index', {register: {email: req.body.email}, alertErrors})
    } else {
        next()
    }
}

function home(req, res, next) {
    const errors = getErrors(validationResult(req))
    if (errors) {
        console.log(errors)
        return res.render('home', { payload: req.payload, alert: { type: 'error', msg: errors }})
    } else {
        next()
    }
}

module.exports = {
    index,
    register,
    home
}

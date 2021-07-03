require('../models/user')
require('../models/invitation')
const crypto = require('crypto')
const mongoose = require("mongoose")
const User = mongoose.model('User')
const path = require('path')
const fs = require('fs')
const jwt = require('jsonwebtoken')
const jwtSeconds = 900
const Invitation = mongoose.model('Invitation')


function getIndexPage(req, res) {
    res.render('index')
}

function getRegistrationPage(req, res) {
    let email = req.params.email
    if (!email) {
        res.redirect('/')
    } else {
        res.render('index', {register: {email: decodeURIComponent(email)}})
    }
}
function getLoginPage(req, res) {
    let email = req.params.email
    if (!email) {
        res.redirect('/')
    } else {
        res.render('index', {login: {email: decodeURIComponent(email)}})
    }
}

/**
 * Generates random string of characters i.e salt
 * @function
 * @returns salt (hexadecimal)
 */
function generateSalt() {

    //Generate a random sequence of bytes
    const randomBytes = crypto.randomBytes(16)
    // Return the result in hexadecimal format
    return randomBytes.toString('hex')
}

/**
 * Hash a password with sha512
 * @function
 * @param password
 * @param salt
 * @return digest (hexadecimal)
 */
function hash(password, salt) {

    // Prepend the salt to the given password and hash it using the sha512 hash function
    const digest = crypto.pbkdf2Sync(
        password,
        salt,
        10000,
        512,
        'sha512')
    // Return the result in hexadecimal format
    return digest.toString('hex')
}

/**
 * Generates a JSON Web Token
 * @function
 * @param id, email, uname,
 * @returns jwt
 */
function generateJWT(id, email, uname) {
    const secret = fs.readFileSync(path.join(__dirname, '/../certs/jwt-secret.txt'), 'ascii')
        .split('--')[0]
    return jwt.sign({ id, email, uname }, secret, { expiresIn: jwtSeconds + 's' })
}
/**
 * Identifies whether a User is registered or not
 * @function
 * @param req
 * @param res
 * @json req.body: {email: string}
 * @returns 200, 404, 500
 */
function identifyUser(req, res) {

    // Collect the email from the body JSON
    const email = req.body.email

    // Find if exists with that email
    User.findOne({"email": email}, {"email": 1}, {},(err, user) => {
        if (err) {
            return res.status(500).render('index', { alert: { type: 'warning', msg: 'Database error. Please try again later...'} })
        } else if (user) {
            //TODO: Login attempts for captcha
            //TODO: IPs missmatch captcha
            return res.render('index', { login: {email: email}, alert: { type: 'info', msg: 'Welcome back! Please, enter your credentials below.'} })
        }
        //TODO: Account activation
        Invitation.countDocuments({"email": email}, (err, count) => {
            if (err) {
                return res.status(500).render('index', { alert: { type: 'warning', msg: 'Database error. Please try again later...'} })
            } else if (count > 0) {
                return res.render('index', { register: {email: email}, alert: { type: 'info', msg: 'Welcome! Fill out the form below.'} })
            } else {
                return res.render('index', { alert: { type: 'error', msg: 'To access you need an invitation.'} })
            }
        })
    })
}

/**
 * Register a new User
 * @function
 * @param req
 * @param res
 * @json req.body: {name: string, surname:string, email:string, pass: string}
 * @returns 201 or 409
 */
function registerUser(req, res) {

    return res.json(req.body)

    // Collect all User data from the body JSON
    const email = req.body.email
    const uname = req.body.uname
    const pass = req.body.pass
    const cpass = req.body.cpass
    const hcaptcha = req.hcaptcha

    // Check if passwords match
    if (pass !== cpass) {
        return res.status(400).render('index', {register: {email}, alert: {type: 'error', msg: 'Passwords do not match.'}})
    }

    console.log(hcaptcha)
    // Validate hCaptcha
    if (!hcaptcha.success) {
        return res.status(400).render('index', {register: {email}, alert: {type: 'error', msg: 'You are a robot!'}})
    }

    // Find if exists a User with that email
    User.countDocuments({"email": email}, (err, count) => {
        if (err) {
            return res.status(500).render('index', { alert: { type: 'warning', msg: 'Database error. Please try again later...'} })
        } else if (count > 0) {
            return res.status(409).render('index', {register: {email}, alert: {type: 'error', msg: 'User with that email already exists.'}})
        }
        // Find if exists a User with that username
        User.countDocuments({"uname": uname}, (err, count) => {
            if (err) {
                return res.status(500).render('index', { alert: { type: 'warning', msg: 'Database error. Please try again later...'} })
            } else if (count > 0) {
                return res.status(409).render('index', {register: {email}, alert: {type: 'error', msg: 'Username already exists.'}})
            }

            // Generate the salt and calculate the digest
            const salt = generateSalt()
            const digest = hash(pass, salt)

            // Save it in the database
            const user = new User({email, uname, digest, salt})
            user.save({},(err, doc) => {
                if (err) {
                    return res.status(500).render('index', { alert: { type: 'warning', msg: 'Database error. Please try again later...'} })
                } else {
                    let token = generateJWT(doc._id, doc.email, doc.uname)
                    res.cookie('token', token, { maxAge: jwtSeconds * 1000, httpOnly: true, secure: true})
                    return res.redirect('/')
                }
            })
        })
    })
}

/**
 * Login a User
 * @function
 * @param req
 * @param res
 * @json req.body: {email:string, pass: string}
 * @returns 200, 401 or 404
 */
function loginUser(req, res) {

    // Collect the credentials from the body JSON
    let email = req.body.email;
    let pass = req.body.pass;

    // Find the User
    User.findOne({"email": email}, {}, {}, (err, doc) => {
        if (err) {
            return res.status(500).render('index', { alert: { type: 'warning', msg: 'Database error. Please try again later...'} })
        } else if (!doc) {
            return res.status(401).render('index', {login: {email}, alert: {type: 'error', msg: 'Incorrect password.'}})
        }

        // Collect its digest and salt from database
        let digest = doc.digest
        let salt = doc.salt

        // Make a hash with the provided password and compare
        if (digest === hash(pass, salt)) {
            let token = generateJWT(doc._id, doc.email, doc.uname)
            console.log('token', token)
            res.cookie('token', token, { maxAge: jwtSeconds * 1000, httpOnly: true, secure: true})
            return res.redirect('/')
        } else {
            return res.status(401).render('index', {login: {email}, alert: {type: 'error', msg: 'Incorrect password.'}})
        }

    })
}

module.exports = {
    getIndexPage,
    getRegistrationPage,
    getLoginPage,
    identifyUser,
    registerUser,
    loginUser
}

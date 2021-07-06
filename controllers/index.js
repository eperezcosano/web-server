const mongoose = require("mongoose")
require('../models/user')
const User = mongoose.model('User')
require('../models/invitation')
const Invitation = mongoose.model('Invitation')
require('../models/activation')
const Activation = mongoose.model('Activation')
require('../models/login_attempt')
const LoginAttempt = mongoose.model('LoginAttempt')
const crypto = require('crypto')
const path = require('path')
const fs = require('fs')
const jwt = require('jsonwebtoken')
const jwtSeconds = 900

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
async function identifyUser(req, res) {
    try {
        // Collect the email from the body JSON
        const email = req.body.email

        // Find if exists with that email
        const user = await User.findOne({"email": email}, {"email": 1})

        if (user) {
            // User registered
            //TODO: IPs missmatch captcha
            console.log('current IP', req.ip, "db IP", user.ip)
            //TODO: Account activation
            console.log('Activation', user.activation)
            //TODO: collect lasts attempts if captcha
            return res.render('index', { login: {email: email}, alert: { type: 'info', msg: 'Welcome back! Please, enter your credentials below.'} })
        } else {
            // User not registered
            // Check if has an invitation
            const invitation = await Invitation.countDocuments({"email": email})
            if (invitation > 0) {
                // User has been invited, proceed registration
                return res.render('index', { register: {email: email}, alert: { type: 'info', msg: 'Welcome! Fill out the form below.'} })
            } else {
                // User has not been invited, deny registration
                return res.render('index', { alert: { type: 'error', msg: 'To access you need an invitation.'} })
            }
        }
    } catch (err) {
        // Database error
        console.error(err)
        return res.status(500).render('index', { alert: { type: 'warning', msg: 'Database error. Please try again later...'} })
    }
}

/**
 * Register a new User
 * @function
 * @param req
 * @param res
 * @json req.body: {name: string, surname:string, email:string, pass: string}
 * @returns 201 or 409
 */
async function registerUser(req, res) {
    try {
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

        // Check if is a robot
        if (!hcaptcha) {
            return res.status(400).render('index', {register: {email}, alert: {type: 'error', msg: 'You are a robot!'}})
        }

        let count
        // Find if exists a User with that email
        count = await User.countDocuments({"email": email})
        if (count > 0) {
            // User with that email already exists
            return res.status(409).render('index', {register: {email}, alert: {type: 'error', msg: 'User with that email already exists.'}})
        }

        // Find if exists a User with that email
        count = await User.countDocuments({"uname": uname})
        if (count > 0) {
            // Username already exists
            return res.status(409).render('index', {register: {email}, alert: {type: 'error', msg: 'Username already exists.'}})
        }

        // Generate the salt and calculate the digest
        const salt = generateSalt()
        const digest = hash(pass, salt)

        // Create a new User
        const user = new User({
            email: email,
            uname: uname,
            rol: null,
            ip: req.ip,
            activation: false,
            digest: digest,
            salt: salt
        })

        // Save it in the database
        await user.save()

        // Create code activation
        const code = generateSalt()
        const activation = new Activation({email, code})
        await activation.save()

        // TODO: send email
        return res.render('index', {alert: {type: 'success', msg: 'Check your inbox to confirm registration.'}})

    } catch (err) {
        // Database error
        console.error(err)
        return res.status(500).render('index', { alert: { type: 'warning', msg: 'Database error. Please try again later...'} })
    }
}

/**
 * Login a User
 * @function
 * @param req
 * @param res
 * @json req.body: {email:string, pass: string}
 * @returns 200, 401 or 404
 */
async function loginUser(req, res) {
    try {
        // Collect the credentials from the body JSON
        const email = req.body.email
        const pass = req.body.pass

        // Find the User
        const user = await User.findOne({"email": email})
        if (!user) {
            // User not found
            return res.status(401).render('index', {login: {email}, alert: {type: 'error', msg: 'Incorrect password.'}})
        }
        if (!user.activation) {
            // User not activated
            const activation = await Activation.findOne({"email": email})
            if (req.body.code !== activation.code) {
                // Incorrect code
                return res.status(400).render('index', {login: {email}, alert: {type: 'error', msg: 'Incorrect code.'}})
            }

            // TODO: check expiration 86400ms
            // Delete activation
            await Activation.deleteMany({"email": email})

            // Update User to activated
            await User.updateOne({"email": email}, {"activation": true})

        } else {
            // User is activated

            // Collect its digest and salt from database
            const digest = user.digest
            const salt = user.salt

            // Make a hash with the provided password and compare
            if (digest === hash(pass, salt)) {
                const token = generateJWT(user._id, user.email, user.uname)
                res.cookie('token', token, { maxAge: jwtSeconds * 1000, httpOnly: true, secure: true})
                return res.redirect('/')
            } else {
                return res.status(401).render('index', {login: {email}, alert: {type: 'error', msg: 'Incorrect password.'}})
            }
        }

    } catch (err) {
        // Database error
        console.error(err)
        return res.status(500).render('index', { alert: { type: 'warning', msg: 'Database error. Please try again later...'} })
    }
}

module.exports = {
    getIndexPage,
    getRegistrationPage,
    getLoginPage,
    identifyUser,
    registerUser,
    loginUser
}

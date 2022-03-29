const express = require('express')
const router = express.Router()
const User = require('../../models/User')
const { hashPassword } = require('../../utils/password')
const { generateToken } = require('../../utils/tokens')
const { verifyToken } = require('../../utils/tokens')

router.post('/', async (req, res) => {
    User.create({
        username: req.body.username,
        password: req.body.password,
    })
        .then(data => {
            generateToken(data.id, data.username)
                .then(token => res.send({
                    message: 'Registered successfully',
                    accessToken: token,
                }))
                .catch(err => res.send(err))
        })
        .catch(err => res.send(err))
})

module.exports = router
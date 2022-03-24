const express = require('express')
const router = express.Router()
const User = require('../../models/User')
const { comparePassword } = require('../../utils/password')
const { generateToken } = require('../../utils/tokens')

router.post('/', async (req, res) => {
    User.findOne({ where: { email: req.body.email } })
        .then(user => {
            comparePassword(req.body.password, user.password)
                .then(correct => {
                    if (correct) {
                        generateToken(user.id, user.email)
                            .then(token => res.send({
                                message: 'Logged in successfully',
                                accessToken: token,
                            }))
                            .catch(err => res.send(err))
                    } else {
                        res.send({ message: 'Incorrect credentials' })
                    }
                })
        })
        .catch(err => res.send(err))
})

module.exports = router
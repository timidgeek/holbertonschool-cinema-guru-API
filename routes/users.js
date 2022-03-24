const express = require('express')
const router = express.Router()
const csv = require("csvtojson");
const utf8 = require("utf8");
const User = require('../models/User')
const { verifyToken } = require('../utils/tokens')

router.get('/', verifyToken, (req, res) => {
    User.findAll().then(data => res.send(data))
})

router.get('/:username', verifyToken, (req, res) => {
    const { username } = req.params
    User.findOne({ where: { username } }).then(data => res.send(data))
})

module.exports = router

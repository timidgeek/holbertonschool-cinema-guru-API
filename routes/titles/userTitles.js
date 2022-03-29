const express = require('express')
const router = express.Router()
const { Title, UserFavourites, UserWatchLater } = require('../../models/Title')
const User = require('../../models/User')
const UserActivity = require('../../models/UserActivity')
const { verifyToken } = require('../../utils/tokens')

router.get('/favorite/', verifyToken, (req, res) => {
    User.findOne({ where: { id: req.userId }, include: { model: Title, as: "favourite" } }).then(user => {
        res.send(user.favourite)
    })
})

router.get('/watchLater/', verifyToken, (req, res) => {
    User.findOne({ where: { id: req.userId }, include: { model: Title, as: "watchLater" } }).then(user => {
        res.send(user.watchLater)
    })
})

router.post('/favorite/:imdbId', verifyToken, (req, res) => {
    const { imdbId } = req.params
    User.findOne({ where: { id: req.userId }, include: { model: Title, as: "favourite" } }).then(user => {
        Title.findOne({ where: { imdbId } }).then(async title => {
            await user.addFavourite(title, { as: "favourite" })
            await UserActivity.create({
                userId: user.id,
                TitleId: title.id,
                activityType: "favourite"
            })
            res.send(user.favourite)
        })
    })
})

router.post('/watchlater/:imdbId', verifyToken, (req, res) => {
    const { imdbId } = req.params
    User.findOne({ where: { id: req.userId }, include: { model: Title, as: "watchLater" } }).then(user => {
        Title.findOne({ where: { imdbId } }).then(async title => {
            await user.addWatchLater(title, { as: "watchLater" })
            await UserActivity.create({
                userId: user.id,
                TitleId: title.id,
                activityType: "watchLater"
            })
            res.send(user.watchLater)
        })
    })
})

router.delete('/favorite/:imdbId', verifyToken, async (req, res) => {
    const { imdbId } = req.params
    const title = await Title.findOne({ where: { imdbId } })
    const user = await User.findOne({ where: { id: req.userId } })
    await (await UserFavourites.findOne({ where: { UserId: req.userId, TitleId: title.id } })).destroy()
    const userActivity = await UserActivity.create({
        userId: user.id,
        TitleId: title.id,
        activityType: "removeFavourited"
    })
    res.send(userActivity)
    // await (await UserFavourites.findAll()).forEach(fav => fav.destroy())
    // await (await UserActivity.findAll()).forEach(fav => fav.destroy())
    // res.send('lol')
})

router.delete('/watchlater/:imdbId', verifyToken, async (req, res) => {
    const { imdbId } = req.params
    const title = await Title.findOne({ where: { imdbId } })
    const user = await User.findOne({ where: { id: req.userId } })
    await (await UserWatchLater.findOne({ where: { UserId: req.userId, TitleId: title.id } })).destroy()
    const userActivity = await UserActivity.create({
        userId: user.id,
        TitleId: title.id,
        activityType: "removeWatchLater"
    })
    res.send(userActivity)
})


module.exports = router

const express = require('express')
const router = express.Router()
const Title = require('../models/Title')
const axios = require('axios')
const async = require('async')
const { verifyToken } = require('../utils/tokens')
const delay = ms => new Promise(res => setTimeout(res, ms));


router.get('/advancedsearch', async (req, res) => {
    const params = {
        maxYear: parseInt(req.query.maxYear) ?? 0,
        minYear: parseInt(req.query.minYear) ?? 0,
        sort: req.query.sort ?? "",
        genres: req.query.genres ?? "",
    }
    let titles = await Title.findAll()
    if (params.maxYear) titles = titles.filter(title => title.dataValues.released <= params.maxYear)
    if (params.minYear) titles = titles.filter(title => title.dataValues.released >= params.minYear)
    if (params.genres) {
        const genres = params.genres.split(',').map(genre => genre.charAt(0).toUpperCase() + genre.slice(1))
        titles = titles.filter(title => title.dataValues.genres.some(genre => genres.includes(genre)))
    }
    if (params.sort) {
        switch (params.sort) {
            case "latest":
                titles = titles.sort((a, b) => a.dataValues.released > b.dataValues.released)
                break;
            case "oldest":
                titles = titles.sort((a, b) => a.dataValues.released < b.dataValues.released)
                break;
            case "highestrated":
                titles = titles.sort((a, b) => a.dataValues.imdbrating > b.dataValues.imdbrating)
                break;
            case "lowestrated":
                titles = titles.sort((a, b) => a.dataValues.imdbrating < b.dataValues.imdbrating)
                break;
            default:
                throw new Error("Invalid sort")
        }
    }
    res.send(titles)

})

router.get('/:imdbId', verifyToken, (req, res) => {
    const { imdbId } = req.params
    Title.findOne({ where: { imdbId } }).then(data => res.send(data))
})

router.post('/seedDb', verifyToken, async (req, res) => {
    const options = {
        method: 'GET',
        url: 'https://ott-details.p.rapidapi.com/advancedsearch',
        params: { page: '2' },
        headers: {
            'X-RapidAPI-Host': 'ott-details.p.rapidapi.com',
            'X-RapidAPI-Key': 'acc3485e54msh177188f4a8cb3f8p1d576ajsna0cf114f55c2'
        }
    }
    const seeded = []
    try {
        const response = await axios.request(options)
        async.eachSeries(response.data.results, async title => {
            const options = {
                method: 'GET',
                url: 'https://ott-details.p.rapidapi.com/getadditionalDetails',
                params: { imdbid: title.imdbid },
                headers: {
                    'X-RapidAPI-Host': 'ott-details.p.rapidapi.com',
                    'X-RapidAPI-Key': 'acc3485e54msh177188f4a8cb3f8p1d576ajsna0cf114f55c2'
                }
            }
            await delay(2000);
            const response = await axios.request(options)
            const { data } = response
            seeded.push(Title.create({
                title: title.title,
                imdbId: title.imdbid,
                synopsis: title.synopsis,
                summary: data.plotSummary,
                imageurls: title.imageurl,
                imdbrating: title.imdbrating ?? -1,
                released: title.released,
                type: title.type,
                trailerUrl: data.trailerUrl,
                reviews: data.reviews,
                quotes: data.quotes,
                genres: title.genre
            }))
        }, () => res.send(seeded));
    } catch (e) {
        res.send(seeded)
        throw e
    }
})

module.exports = router

const express = require('express')
const router = express.Router()
const { Title } = require('../../models/Title')
const { UserFavourites } = require('../../models/Title')
const { UserWatchLater } = require('../../models/Title')
const axios = require('axios')
const async = require('async')
const { verifyToken } = require('../../utils/tokens')
const delay = ms => new Promise(res => setTimeout(res, ms));
const { Op } = require('@sequelize/core');
const userTitlesRouter = require('./userTitles')

router.use('/', userTitlesRouter)

router.get('/', verifyToken, async (req, res) => {
    Title.findAll().then(titles => res.send(titles)).catch(err => res.status(500).send(err))
})

router.get('/advancedsearch', verifyToken, async (req, res) => {
    const maxYear = parseInt(req.query.maxYear)
    const minYear = parseInt(req.query.maxYear)
    const genre = req.query.genres ? req.query.genres.split(',').map(genre => genre.charAt(0).toUpperCase() + genre.slice(1)) : []
    const params = {
        maxYear: isNaN(maxYear) ? 2022 : maxYear,
        minYear: isNaN(minYear) ? 0 : minYear,
        sort: req.query.sort ?? "",
        genres: genre,
        title: req.query.title ? req.query.title : "",
        page: req.query.page ? req.query.page : 1,
    }
    const titles = await Title.findAll({
        where: {
            released: {
                [Op.between]: [params.minYear, params.maxYear]
            },
            genres: {
                [Op.contains]: params.genres ? params.genres : true
            },
            title: {
                [Op.iLike]: `%${params.title}%`
            }
        },
        order: [getSort(params.sort)],
        limit: params.page * 50,
    }).catch(err => res.status(500).send(err))
    res.send({ totalCount: titles.length, titles })
})

router.get('/:imdbId', verifyToken, (req, res) => {
    const { imdbId } = req.params
    Title.findOne({ where: { imdbId } }).then(data => res.send(data)).catch(err => res.status(500).send(err))
})

// router.post('/seedDb', async (req, res) => {
//     let seeded = []
//     const start = 0
//     const promises = Array.from({ length: 20 }, (_, i) => i + start + 1).map((page) => seedPage(page, seeded, start))
//     try {
//         await Promise.all(promises)
//         console.log(seeded);
//     } catch (error) {
//         console.log(error);
//     }
//     res.send(seeded)
// })

// const seedPage = async (page, seeded, start) => {
//     return new Promise((resolve, reject) => {
//         setTimeout(async () => {
//             console.log(`Seeding page: ${page}`);
//             const options = {
//                 method: 'GET',
//                 url: 'https://ott-details.p.rapidapi.com/advancedsearch',
//                 params: { page },
//                 headers: {
//                     'X-RapidAPI-Host': 'ott-details.p.rapidapi.com',
//                     'X-RapidAPI-Key': '8be507723fmshcbfa5a376ac7643p12124bjsn8e26f6167d9b'
//                 }
//             }
//             try {
//                 const response = await axios.request(options)
//                 seeded = await seedTitles(seeded, response, page)
//                 console.log(`Page ${page} successfully seeded.`);
//                 resolve(seeded)
//             } catch (error) {
//                 reject(error)
//             }
//         }, (page - start) * 20000)
//     })
// }

// const seedTitles = async (seeded, response, page) => {
//     return new Promise((resolve, reject) => {
//         const initalLength = seeded.length
//         async.eachSeries(response.data.results, async title => {
//             const options = {
//                 method: 'GET',
//                 url: 'https://ott-details.p.rapidapi.com/getadditionalDetails',
//                 params: { imdbid: title.imdbid },
//                 headers: {
//                     'X-RapidAPI-Host': 'ott-details.p.rapidapi.com',
//                     'X-RapidAPI-Key': '8be507723fmshcbfa5a376ac7643p12124bjsn8e26f6167d9b'
//                 }
//             }
//             await delay(page * 2000);
//             try {
//                 const response = await axios.request(options)
//                 const { data } = response
//                 const newTitle = await Title.create({
//                     title: title.title,
//                     imdbId: title.imdbid,
//                     synopsis: title.synopsis,
//                     summary: data.plotSummary,
//                     imageurls: title.imageurl,
//                     imdbrating: title.imdbrating ?? -1,
//                     released: title.released,
//                     type: title.type,
//                     trailerUrl: data.trailerUrl,
//                     reviews: data.reviews,
//                     quotes: data.quotes,
//                     genres: title.genre
//                 })
//                 seeded.push(newTitle.toJSON())
//             } catch (error) {
//                 reject(error)
//             }
//         }, () => {
//             console.log("callback", seeded.length, initalLength)
//             if (seeded.length !== initalLength + 50) reject(seeded)
//             else resolve(seeded)
//         })
//     })
// }

const getSort = (param) => {
    switch (param) {
        case "oldest":
            return ['released', 'ASC']
        case "highestrated":
            return ['imdbrating', 'DESC']
        case "lowestrated":
            return ['imdbrating', 'ASC']
        default:
            return ['released', 'DESC']
    }
}

module.exports = router

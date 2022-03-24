const DataTypes = require("sequelize").DataTypes;
const sequelize = require('../config/database');
const User = require('./User')

const Title = sequelize.define('Title', {
    title: {
        type: DataTypes.STRING,
        defaultValue: "Title not available"
    },
    imdbId: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true
    },
    synopsis: {
        type: DataTypes.TEXT,
    },
    summary: {
        type: DataTypes.TEXT,
    },
    imageurls: {
        type: DataTypes.ARRAY(DataTypes.STRING),
        defaultValue: []
    },
    imdbrating: {
        type: DataTypes.FLOAT,
        defaultValue: -1
    },
    released: {
        type: DataTypes.INTEGER,
        defaultValue: -1
    },
    type: {
        type: DataTypes.ENUM(["movie", "show"])
    },
    runtime: {
        type: DataTypes.INTEGER,
        defaultValue: -1
    },
    trailerUrl: {
        type: DataTypes.ARRAY(DataTypes.STRING),
        defaultValue: []
    },
    reviews: {
        type: DataTypes.ARRAY(DataTypes.STRING),
        defaultValue: []
    },
    quotes: {
        type: DataTypes.ARRAY(DataTypes.STRING),
        defaultValue: []
    },
    genres: {
        type: DataTypes.ARRAY(DataTypes.STRING),
        defaultValue: []
    }
});

User.hasMany(Title, { as: 'favourites' })
User.hasMany(Title, { as: 'watchLater' })


module.exports = Title;
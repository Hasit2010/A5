require('dotenv').config();
require('pg');
const Sequelize = require('sequelize');

// Database connection
const sequelize = new Sequelize(process.env.DB_DATABASE, process.env.DB_USER, process.env.DB_PASSWORD, {
    host: process.env.DB_HOST,
    dialect: 'postgres',
    port: 5432,
    dialectOptions: {
        ssl: { rejectUnauthorized: false }
    }
});

// Define models
const SubRegion = sequelize.define('SubRegion', {
    id: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    subRegion: Sequelize.STRING,
    region: Sequelize.STRING
}, {
    timestamps: false
});

const Country = sequelize.define('Country', {
    id: {
        type: Sequelize.STRING,
        primaryKey: true
    },
    commonName: Sequelize.STRING,
    officialName: Sequelize.STRING,
    nativeName: Sequelize.STRING,
    currencies: Sequelize.STRING,
    capital: Sequelize.STRING,
    languages: Sequelize.STRING,
    openStreetMaps: Sequelize.STRING,
    population: Sequelize.INTEGER,
    area: Sequelize.INTEGER,
    landlocked: Sequelize.BOOLEAN,
    coatOfArms: Sequelize.STRING,
    flag: Sequelize.STRING,
    subRegionId: Sequelize.INTEGER
}, {
    timestamps: false
});

// Define associations
Country.belongsTo(SubRegion, {foreignKey: 'subRegionId'});

// Functions
function initialize() {
    return new Promise((resolve, reject) => {
        sequelize.sync()
            .then(() => resolve())
            .catch((err) => reject(err));
    });
}

function getAllCountries() {
    return new Promise((resolve, reject) => {
        Country.findAll({
            include: [SubRegion]
        })
        .then(countries => resolve(countries))
        .catch(err => reject(err));
    });
}

function getCountryById(id) {
    return new Promise((resolve, reject) => {
        Country.findAll({
            include: [SubRegion],
            where: { id: id }
        })
        .then(countries => {
            if (countries.length > 0) {
                resolve(countries[0]);
            } else {
                reject("Unable to find requested country");
            }
        })
        .catch(err => reject(err));
    });
}

function getCountriesBySubRegion(subRegion) {
    return new Promise((resolve, reject) => {
        Country.findAll({
            include: [SubRegion],
            where: {
                '$SubRegion.subRegion$': {
                    [Sequelize.Op.iLike]: `%${subRegion}%`
                }
            }
        })
        .then(countries => {
            if (countries.length > 0) {
                resolve(countries);
            } else {
                reject("Unable to find requested countries");
            }
        })
        .catch(err => reject(err));
    });
}

function getCountriesByRegion(region) {
    return new Promise((resolve, reject) => {
        Country.findAll({
            include: [SubRegion],
            where: {
                '$SubRegion.region$': region
            }
        })
        .then(countries => {
            if (countries.length > 0) {
                resolve(countries);
            } else {
                reject("No countries found in this region");
            }
        })
        .catch(err => reject(err));
    });
}

function getAllSubRegions() {
    return new Promise((resolve, reject) => {
        SubRegion.findAll()
            .then(subRegions => resolve(subRegions))
            .catch(err => reject(err));
    });
}

function addCountry(countryData) {
    return new Promise((resolve, reject) => {
        Country.create(countryData)
            .then(() => resolve())
            .catch(err => reject(err.errors[0].message));
    });
}

function editCountry(id, countryData) {
    return new Promise((resolve, reject) => {
        Country.update(countryData, {
            where: { id: id }
        })
        .then(() => resolve())
        .catch(err => reject(err.errors[0].message));
    });
}

function deleteCountry(id) {
    return new Promise((resolve, reject) => {
        Country.destroy({
            where: { id: id }
        })
        .then(() => resolve())
        .catch(err => reject(err.errors[0].message));
    });
}

module.exports = {
    initialize,
    getAllCountries,
    getCountryById,
    getCountriesBySubRegion,
    getCountriesByRegion,
    getAllSubRegions,
    addCountry,
    editCountry,
    deleteCountry
};

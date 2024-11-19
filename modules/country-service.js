require("dotenv").config();
const Sequelize = require("sequelize");

const sequelize = new Sequelize(
  process.env.DB_DATABASE,
  process.env.DB_USER,
  process.env.DB_PASSWORD,
  {
    host: process.env.DB_HOST,
    dialect: "postgres",
    ssl: true,
    dialectOptions: {
      ssl: { require: true, rejectUnauthorized: false },
    },
  }
);

// Models
const SubRegion = sequelize.define(
  "SubRegion",
  {
    id: { type: Sequelize.INTEGER, primaryKey: true, autoIncrement: true },
    subRegion: Sequelize.STRING,
    region: Sequelize.STRING,
  },
  { timestamps: false }
);

const Country = sequelize.define(
  "Country",
  {
    id: { type: Sequelize.STRING, primaryKey: true },
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
    subRegionId: Sequelize.INTEGER,
  },
  { timestamps: false }
);

Country.belongsTo(SubRegion, { foreignKey: "subRegionId" });

// Initialization
function initialize() {
  return sequelize.sync();
}

// Get all countries
function getAllCountries() {
  return Country.findAll({ include: SubRegion });
}

// Get a country by ID
function getCountryById(id) {
  return Country.findByPk(id, { include: SubRegion });
}

// Get countries by sub-region
function getCountriesBySubRegion(subRegionName) {
  return Country.findAll({
    include: {
      model: SubRegion,
      where: { subRegion: { [Sequelize.Op.iLike]: `%${subRegionName}%` } },
    },
  });
}

// Get countries by region
function getCountriesByRegion(regionName) {
  return Country.findAll({
    include: {
      model: SubRegion,
      where: { region: { [Sequelize.Op.iLike]: `%${regionName}%` } },
    },
  });
}

// Get all sub-regions
const getAllSubRegions = async () => {
  try {
    return await SubRegion.findAll();
  } catch (err) {
    throw new Error(`Error getting sub-regions: ${err.message}`);
  }
};

// Add a new country
const addCountry = async (countryData) => {
  try {
    await Country.create(countryData);
  } catch (err) {
    throw new Error(err.errors?.[0]?.message || 'Error creating country');
  }
};

module.exports = {
  initialize,
  getAllCountries,
  getCountryById,
  getCountriesBySubRegion,
  getCountriesByRegion,
  getAllSubRegions,
  addCountry,
};

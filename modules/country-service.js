const countryData = require("../data/countryData");
const subRegionData = require("../data/subRegionData");

let countries = [];

function initialize() {
  return new Promise((resolve, reject) => {
    countryData?.forEach(country => {
      let countryWithSubRegion = { ...country, subRegionObj: subRegionData.find(sr => sr.id == country.subRegionId) }
      countries.push(countryWithSubRegion);
      resolve();
    });
  });

}

function getAllCountries() {
  return new Promise((resolve, reject) => {
    resolve(countries);
  });
}

function getCountryById(id) {

  return new Promise((resolve, reject) => {
    let foundCountry = countries.find(c => c.id == id);

    if (foundCountry) {
      resolve(foundCountry); return;
    } else {
      reject("Unable to find requested country");
    }
  });
}

function getCountriesBySubRegion(subRegion) {

  return new Promise((resolve, reject) => {
    let foundCountries = countries.filter(c => c.subRegionObj.subRegion.toUpperCase().includes(subRegion.toUpperCase()));

    if (foundCountries.length > 0) {
      resolve(foundCountries)
    } else {
      reject(`Unable to find requested countries for the given subRegion - ${subRegion}`);
    }
  });

}

function getCountriesByRegion(region) {

  return new Promise((resolve, reject) => {
    let foundCountries = countries.filter(c => c.subRegionObj.region.toUpperCase().includes(region.toUpperCase()));

    if (foundCountries.length > 0) {
      resolve(foundCountries)
    } else {
      reject(`Unable to find requested countries for the given region - ${region}`);
    }
  });

}


module.exports = { initialize, getAllCountries, getCountryById, getCountriesByRegion, getCountriesBySubRegion }



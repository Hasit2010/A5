/********************************************************************************
*  WEB322 – Assignment 05
* 
*  I declare that this assignment is my own work in accordance with Seneca's
*  Academic Integrity Policy:
* 
*  https://www.senecacollege.ca/about/policies/academic-integrity-policy.html
* 
*  Name: Hasit Prakashkumar Patel Student ID: 143320232 Date: 19/11/2024
*
*  Published URL: 
*
********************************************************************************/



const countryData = require("./modules/country-service");
const path = require("path");
const express = require("express");
const { getAllSubRegions, addCountry, getCountryById, getCountriesByRegion, editCountry, deleteCountry } = require('./modules/country-service');

const app = express();
const HTTP_PORT = process.env.PORT || 8080;

// Middleware for serving static files and parsing form data
app.use(express.static(path.join(__dirname, "public")));
app.use(express.urlencoded({ extended: true }));
app.set("view engine", "ejs");
app.set("views", __dirname + "/views");

// Routes
app.get("/", (req, res) => res.render("home"));

app.get("/about", (req, res) => res.render("about"));

app.get("/countries", async (req, res) => {
  try {
    let countries;
    if (req.query.region) {
      countries = await countryData.getCountriesByRegion(req.query.region);
    } else if (req.query.subRegion) {
      countries = await countryData.getCountriesBySubRegion(
        req.query.subRegion
      );
    } else {
      countries = await countryData.getAllCountries();
    }
    res.render("countries", { countries });
  } catch (err) {
    res.status(404).render("404", { message: err.message });
  }
});

app.get("/countries/:id", async (req, res) => {
  try {
    const country = await countryData.getCountryById(req.params.id);
    res.render("country", { country });
  } catch (err) {
    res.status(404).render("404", { message: err.message });
  }
});

// GET /addCountry
app.get("/addCountry", async (req, res) => {
  try {
    const subRegions = await getAllSubRegions();
    res.render("addCountry", { subRegions: subRegions });
  } catch(err) {
    res.render("500", { message: `Error retrieving sub-regions: ${err}` });
  }
});

// POST /addCountry
app.post("/addCountry", async (req, res) => {
  try {
    await addCountry(req.body);
    res.redirect('/countries');
  } catch(err) {
    res.render("500", { message: `I'm sorry, but we have encountered the following error: ${err}` });
  }
});

app.get("/editCountry/:id", (req, res) => {
    Promise.all([
        getCountryById(req.params.id),
        getCountriesByRegion()
    ])
    .then(([countryData, subRegionData]) => {
        res.render("editCountry", { country: countryData, subRegions: subRegionData });
    })
    .catch(err => {
        res.status(404).render("404", { message: err });
    });
});

app.post("/editCountry", (req, res) => {
    editCountry(req.body.id, req.body)
        .then(() => {
            res.redirect("/countries");
        })
        .catch(err => {
            res.render("500", { 
                message: `I'm sorry, but we have encountered the following error: ${err}` 
            });
        });
});

app.get("/deleteCountry/:id", (req, res) => {
    deleteCountry(req.params.id)
        .then(() => {
            res.redirect("/countries");
        })
        .catch(err => {
            res.render("500", { 
                message: `I'm sorry, but we have encountered the following error: ${err}` 
            });
        });
});

// 404 Handler
app.use((req, res) =>
  res.status(404).render("404", { message: "Page not found" })
);

countryData
  .initialize()
  .then(() => {
    console.log("Data imported successfully!");
    app.listen(HTTP_PORT, () => {
      console.log(`Server listening on: http://localhost:${HTTP_PORT}`);
    });
  })
  .catch((err) => {
    console.error("Failed to initialize the database:", err);
  });

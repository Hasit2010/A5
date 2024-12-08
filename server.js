/********************************************************************************
 *  WEB322 – Assignment 06
 *
 *  I declare that this assignment is my own work in accordance with Seneca's
 *  Academic Integrity Policy:
 *
 *  https://www.senecacollege.ca/about/policies/academic-integrity-policy.html
 *
 *  Name: Hasit Patel Student ID: 170852214 Date: 12/06/2023
 *
 *  Published URL: https://web322-a6-hasit.cyclic.app
 *
 ********************************************************************************/

const express = require("express");
const path = require("path");
const countryDB = require("./modules/country-service");
const authData = require("./modules/auth-service");
const clientSessions = require("client-sessions");
require("dotenv").config();

const app = express();
const HTTP_PORT = process.env.PORT || 8080;

// Middleware
app.use(express.static("public"));
app.use(express.urlencoded({ extended: true }));
app.set("view engine", "ejs");

// Setup client-sessions
app.use(
  clientSessions({
    cookieName: "session",
    secret: "web322_assignment6",
    duration: 2 * 60 * 1000,
    activeDuration: 1000 * 60,
  })
);

// Make session data available to templates
app.use((req, res, next) => {
  res.locals.session = req.session;
  next();
});

// Helper middleware
function ensureLogin(req, res, next) {
  if (!req.session.user) {
    res.redirect("/login");
  } else {
    next();
  }
}

// Routes
app.get("/", (req, res) => {
  res.render("home", { page: "/" });
});

app.get("/about", (req, res) => {
  res.render("about", { page: "/about" });
});

// Login Routes
app.get("/login", (req, res) => {
  res.render('login', {
    errorMessage: null,
    userName: ''
  });
});

app.post("/login", (req, res) => {
  req.body.userAgent = req.get('User-Agent');
  
  authData.checkUser(req.body)
    .then((user) => {
      req.session.user = {
        userName: user.userName,
        email: user.email,
        loginHistory: user.loginHistory
      };
      res.redirect('/countries');
    })
    .catch(err => {
      res.render('login', {
        errorMessage: err,
        userName: req.body.userName
      });
    });
});

// Register Routes
app.get("/register", (req, res) => {
  res.render('register', {
    errorMessage: null,
    successMessage: null,
    userName: ''
  });
});

app.post("/register", (req, res) => {
  authData.registerUser(req.body)
    .then(() => {
      res.render('register', {
        successMessage: "User created",
        errorMessage: null,
        userName: ''
      });
    })
    .catch(err => {
      res.render('register', {
        errorMessage: err,
        successMessage: null,
        userName: req.body.userName
      });
    });
});

// Logout route
app.get("/logout", (req, res) => {
  req.session.reset();
  res.redirect('/');
});

// User History route
app.get("/userHistory", ensureLogin, (req, res) => {
  res.render("userHistory", { page: "/userHistory" });
});

// Country routes
app.get("/countries", (req, res) => {
    const region = req.query.region;
    
    const getCountries = region 
        ? countryDB.getCountriesByRegion(region)
        : countryDB.getAllCountries();
        
    getCountries
        .then((data) => {
            res.render("countries", { 
                countries: data,
                region: region || null,
                message: null
            });
        })
        .catch((err) => {
            res.render("countries", { 
                countries: [],
                region: region || null,
                message: "No results found"
            });
        });
});

// Single country route
app.get("/countries/:id", async (req, res) => {
    try {
        const country = await countryDB.getCountryById(req.params.id);
        res.render("country", { country: country });
    } catch (error) {
        res.status(404).render("404", { message: error.message });
    }
});

// Protected routes - require login
app.get("/country/:id", (req, res) => {
    countryDB.getCountryById(req.params.id)
        .then((country) => {
            if (country) {
                res.render("country", { 
                    country: country,
                    session: req.session
                });
            } else {
                res.status(404).render("404", {
                    message: "Country not found",
                    session: req.session
                });
            }
        })
        .catch((err) => {
            res.status(404).render("404", {
                message: "Country not found",
                session: req.session
            });
        });
});

app.get("/addCountry", ensureLogin, (req, res) => {
  countryDB
    .getAllSubRegions()
    .then((subRegions) => {
      res.render("addCountry", {
        subRegions: subRegions,
        page: "/addCountry",
      });
    })
    .catch((err) => {
      res.status(500).render("500", {
        message: `Error: ${err}`,
        page: "/addCountry",
      });
    });
});

app.post("/addCountry", ensureLogin, (req, res) => {
  countryDB
    .addCountry(req.body)
    .then(() => {
      res.redirect("/countries");
    })
    .catch((err) => {
      res.status(500).render("500", {
        message: `Error: ${err}`,
        page: "/addCountry",
      });
    });
});

// Edit Country Routes
app.get('/editCountry/:id', ensureLogin, async (req, res) => {
    try {
        const [country, subRegions] = await Promise.all([
            countryDB.getCountryById(req.params.id),
            countryDB.getAllSubRegions()
        ]);
        res.render('editCountry', { country: country, subRegions: subRegions });
    } catch(err) {
        res.status(404).render('404', { message: err });
    }
});

app.post('/editCountry', ensureLogin, async (req, res) => {
    try {
        await countryDB.editCountry(req.body.id, req.body);
        res.redirect('/countries');
    } catch(err) {
        res.render('500', { message: `Error: ${err}` });
    }
});

// Delete Country Route
app.get('/deleteCountry/:id', ensureLogin, async (req, res) => {
    try {
        await countryDB.deleteCountry(req.params.id);
        res.redirect('/countries');
    } catch(err) {
        res.render('500', { message: `Error: ${err}` });
    }
});

// 404 handler for undefined routes
app.use((req, res) => {
    res.status(404).render("404", {
        message: "Page Not Found",
        session: req.session
    });
});

// Initialize both services before starting the server
Promise.all([countryDB.initialize(), authData.initialize()])
    .then(() => {
        app.listen(HTTP_PORT, () => {
            console.log('✓ Server running successfully at http://localhost:8080');
        });
    })
    .catch((err) => {
        console.error('✘ Error:', err);
    });

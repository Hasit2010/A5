const countryData = require("./modules/country-service");
const path = require("path");

const express = require('express');
const app = express();

const HTTP_PORT = process.env.PORT || 8080;

// app.use(express.static('public')); // causing tailwindCSS not working on vercel.com
app.use(express.static(path.join(__dirname, 'public')));
app.set('view engine', 'ejs');

app.set('views', __dirname + '/views');


app.get('/', (req, res) => {
  res.render("home")
});

app.get('/about', (req, res) => {
  res.render("about");
});

app.get("/countries", async (req,res)=>{

  let countries = [];
  try {
    if(req.query.region){
      countries = await countryData.getCountriesByRegion(req.query.region);
    } else if(req.query.subRegion) {
      countries = await countryData.getCountriesBySubRegion(req.query.subRegion);
    } else {
      countries = await countryData.getAllCountries();
    }

    res.render("countries", {countries})
  }catch(err){
    res.status(404).render("404", {message: err});
  }

});

app.get("/countries/:id", async (req,res)=>{
  
  try{
    let country = await countryData.getCountryById(req.params.id);
    // res.send(country);
    res.render("country", {country})
  }catch(err){
    console.log(" err:",  err)
    res.status(404).render("404", {message: err});
  }
});

app.use((req, res, next) => {
  res.status(404).render("404", {message: "I'm sorry, we're unable to find what you're looking for"});
});


countryData.initialize().then(()=>{
  app.listen(HTTP_PORT, () => { console.log(`server listening on: ${HTTP_PORT}`) });
});

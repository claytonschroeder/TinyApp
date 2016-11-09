var express = require("express");
var app = express();
var PORT = process.env.PORT || 8080; // default port 8080

app.set("view engine", "ejs")

var urlDatabase = {
  "b2xVn2": "http://www.lighthouselabs.ca",
  "9sm5xK": "http://www.google.com"
};

function generateRandomString() {
    var text = "";
    var possible = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
    for( var i = 0; i < 6; i++ ) {
      text += possible.charAt(Math.floor(Math.random() * possible.length))
    };
return text;
}

app.get("/", (req, res) => {
  res.end("Hello!");
});

//hello page
app.get("/hello", (req, res) => {
  res.end("<html><body>Hello <b>World</b></body></html>\n");
});

//url page
app.get("/urls", (req, res) => {
  let templateVars = { urls: urlDatabase };
  res.render("urls_index", templateVars);
});

app.get("/urls/new", (req, res) => {
  res.render("urls_new");
});

app.post("/urls", (req, res) => {
  console.log(req.body);  // debug statement to see POST parameters
  res.send("Ok");         // Respond with 'Ok' (we will replace this)
});

//url id page
app.get("/urls/:id", (req, res) => {
  let key = req.params.id
  let actualURL = urlDatabase[key]
  let templateVars = { shortURL: req.params.id, longURL: actualURL };
  res.render("urls_show", templateVars);
});

//route to handle shortURL requests:
app.get("/u/:shortURL", (req, res) => {
  let longURL =
  res.redirect(longURL);
});

const bodyParser = require("body-parser");
app.use(bodyParser.urlencoded({extended: true}));


app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});
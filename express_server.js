const express = require("express");
const app = express();
const PORT = process.env.PORT || 8080;
const cookieParser = require('cookie-parser')
const bodyParser = require("body-parser");

app.use(bodyParser.urlencoded({extended: true}));
app.use(cookieParser())
app.set("view engine", "ejs")


var urlDatabase = {
  "b2xVn2": "http://www.lighthouselabs.ca",
  "9sm5xK": "http://www.google.com"
};

app.get("/urls.json", (req, res) => {
  res.json(urlDatabase);
});

app.get("/urls", (req, res) => {
  let templateVars = { urls: urlDatabase,
  username: req.cookies.username };
  res.render("urls_index", templateVars);
});

app.post("/urls", (req, res) => {
  let shortURL = generateRandomString();
  let longURL = req.body.longURL
  urlDatabase[shortURL] = longURL;
  res.redirect(`/urls/${shortURL}`);
});

app.post("/login", (req, res) => {
  let loginID = req.body.loginID;
  res.cookie('username', loginID);
  res.redirect("/urls");
});

app.post("/logout", (req, res) => {
  let logout = req.body.logout;
  res.clearCookie('username');
  res.redirect("/urls");
});

app.get("/", (req, res) => {
  res.end("Hello!");
});


app.get("/urls/new", (req, res) => {
  let templateVars = {
    urls: urlDatabase,
    username: req.cookies.username};
  res.render("urls_new", templateVars);
});

app.get("/urls/:id", (req, res) => {
  let key = req.params.id;
  let actualURL = urlDatabase[key];
  let templateVars = {
    shortURL: key,
    longURL: actualURL,
    urls: urlDatabase,
    username: req.cookies.username};
  res.render("urls_show", templateVars);
});


app.get("/u/:shortURL", (req, res) => {
  let templateVars = {
    urls: urlDatabase,
    username: req.cookies.username
  };
  let key = req.params.shortURL
  let longURL = urlDatabase[key];
  res.redirect(longURL);
})


app.get("/hello", (req, res) => {
  let templateVars = {
    urls: urlDatabase,
    username: req.cookies.username
  };
  res.end("<html><body>Hello <b>World</b></body></html>\n");
});

app.post("/urls/:id/delete", (req, res) => {
  let deleteKey = req.params.id;
  // console.log("!!!", req.params.id);
  delete urlDatabase[deleteKey];
  res.redirect("/urls");
});

app.post("/urls/:id/update", (req, res) => {
  let key = req.params.id;
  urlDatabase[key] = req.body.newURL;
  res.redirect("/urls");
});

// let templateVars = {
//     username: res.cookies["username"],
// };

// res.render("index", templateVars);

function generateRandomString() {
    let rand = "";
    let possible = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
    for( var i = 0; i < 6; i+= 1 ) {
      rand += possible.charAt(Math.floor(Math.random() * possible.length))
    };
return rand;
}

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});

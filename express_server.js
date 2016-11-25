//=============DEPENDENCIES======================//
const express = require('express');
const app = express();
const PORT = process.env.PORT || 8080;
const cookieParser = require('cookie-parser')
const bodyParser = require('body-parser');
const cookieSession = require('cookie-session')
const bcrypt = require('bcrypt');
const session = require('express-session');
//===================================================//
app.use(bodyParser.urlencoded({extended: true}));
app.use(cookieParser());
app.use(cookieSession({
  name: 'session',
  keys: ['secret'],
}))
//===================================================//
app.set('view engine', 'ejs');
//===================================================//


//==============USER DATABASE=======================//
var userDatabase = {
  'clay@hotmail.com':
   { email: 'clay@hotmail.com',
     password: '$2a$08$BHOlsRU4mcqodqiSA.hjT.RZU6u9cdQUjnihFGWk.BEnsO51l2dce',
     urls: {
      xXxXx: 'http://www.facebook.com',
      yYyYy: 'http://www.google.com'
     }
   },
  'newemail@email.com':
   { email: 'newemail@email.com',
     password: '$2a$08$TXYSaBldMlLNkz/TYhxQvOb0jkODw0.FEPLsLR/9PaX9JMsWvqMMO',
     urls: {
      010101: 'http://www.nhl.com',
      909090: 'http://www.youtube.com'
     }
   }
};

//===============AUTHORIZATION CHECK===================//
function auth(req, res, next) {
  if(req.session.email) {
    next();
  } else {
    res.status(401);
    res.render('urls_require_login');
  }
}
//===============ERROR HANDLING PAGES===================//
app.get('/urls_error', (req, res) => {
  res.render('urls_error');
});

app.get('/urls_require_login', (req, res) => {
  res.render('urls_require_login');
});

app.get('/urls_error_alreadyexists', (req, res) => {
  res.render('urls_error_alreadyexists');
});

app.get('/urls_nonexist', (req, res) => {
  res.render('urls_nonexist');
});

app.get('/urls_not_authorized', (req, res) => {
  res.render('urls_not_authorized');
});

//=================GET: REGISTRATION=====================//
//  registration page contains a form for user to enter
//  email and password.
app.get('/register', (req, res) => {
  if(req.session.email){
    res.redirect('/')
    } else {
    res.render('urls_register')
  }
});
//===================================================//

//=================POST: REGISTRATION=====================//
//  post registration takes email and password form and adds
//  info to the userDatabase. emails are stored in plain text.
//  passwords are stored as hashed string. if a user doesnt
//  enter an email or password it resets the registration page.
//  if the form likes what it recieves. the input is added
//  to the userDatabase and redirects user to the /login page.
app.post('/register', (req, res) => {
  let email = req.body.email;
  let password = req.body.password;
  const saltround = 8;
  if (!email || !password) {
    res.status(400);
    res.render('urls_error')
  }
  if(email in userDatabase) {
    res.status(400);
    res.redirect('urls_error_alreadyexists')
  } else {
  const hash = bcrypt.hashSync(req.body.password, 8);
  userDatabase[email] = {'email': email, 'password': hash, 'urls': {} };
  req.session.email = email;
  res.redirect('/login');
  }
});
//===================================================//

//=================GET: LOGIN PAGE=====================//
//  login page contains a form for user to enter their email
//  and password (generated in the registration process)
app.get('/login', (req, res) => {
  if(req.session.email){
    res.redirect('/')
    } else {
    res.render('urls_login', { active: req.session.email });
  }
});
//===================================================//

//=================POST: LOGIN PAGE=====================//
//  user will fill out form with email and password.
//  input is ran agains the userDatabase to find a match.
//  if it finds a match it will redirect them to their
//  urls_list (home page). otherwise it will redirect them to
//  the urls_error page, which allows them to redirect to
//  registration page.

app.post('/login', (req, res) => {
  let email = req.body.email;
  if(userDatabase[email] && bcrypt.compareSync(req.body.password, userDatabase[email].password)) {
    req.session.email = email;
    res.redirect('/urls_list');
  } else {
    res.redirect('/urls_error');
  }
});



//===================================================//

//=================POST: LOGOUT PAGE=====================//
//  when a user logs out it deletes their session key, and
//  redirects them to the login page. if they log back in
//  their URLs will still appear. Or a different user can
//  log in.
app.post('/logout', (req, res) => {
  req.session = null;
  res.redirect('/login');
});
//===================================================//

//=================GET: HOME PAGE=====================//
//  homepage requires a session email to be present, which
//  is generated through the login post. if an email is present
//  the user is redirected to /urls. otherwise, they
//  will be redirected to the login screen.
app.get('/', (req, res) => {
  if(req.session.email) {
    res.redirect('/urls');
  } else {
    res.redirect('/login');
  }
});
//===================================================//


//=================GET: HOMEPAGE=======================//
app.get('/urls_list', auth, (req, res) => {
  let userEmail = userDatabase[req.session.email].urls;
  let templateVars = {
    urls: userEmail,
    email: req.session.email
  };
  res.render('urls_list', templateVars);
});
//===================================================//

//===================GET: URLS===========================//
app.get('/urls', auth, (req, res) => {
  let userEmail = userDatabase[req.session.email].urls;
  let templateVars = {
    urls: userEmail,
    email: req.session.email
  };
  res.render('urls_index', templateVars);
});


//===================================================//

//=============GET: SHORT URL REDIRECT===============//
//  this page should be accessable by anyone. Someone
//  should be able to visit /u/'shortURL' and be re-
//  directed to the longURL.
app.get('/u/:shortURL', (req, res) => {
  let shortURL = req.params.shortURL;
  let URLexistance = false;
  for (let email in userDatabase) {
    for (let key in userDatabase[email].urls) {
      if(key === shortURL) {
        res.redirect(userDatabase[email].urls[shortURL]);
        URLexistance = true;
      }
    }
  }
  if (!URLexistance) {
    return res.status(404).render('urls_nonexist');
  }
});
//===================================================//

//============GET: NEW URLS=======================//
app.get('/urls/new',auth, (req, res) => {
  let templateVars = {
    email: req.session.email
  }
  res.render('urls_new', templateVars);
});
//===================================================//

//============POST: NEW URLS=====================//
app.post('/urls/new', (req, res) => {
  let email = req.session.email;
  let shortURL = generateRandomString();
  let longURL = req.body.longURL;
  userDatabase[email].urls[shortURL] = longURL;
  res.redirect('/urls');
});
//===================================================//

//===================GET SHORT URLS=======================//
app.get('/urls/:shortURL', auth, (req, res) => {
  let shortURL = req.params.shortURL;
  let email = req.session.email
  let longURL = userDatabase[email].urls[shortURL];
  let templateVars = {
    shortURL: shortURL,
    email: email,
    longURL: longURL
  };

  if(userDatabase[email].urls[shortURL]){
      //  current user owns short url
    return res.render('urls_show', templateVars);
  }

  for(let userID in userDatabase) {
    if(userDatabase[userID].urls[shortURL]) {
      //if some other user own the short URL
      return res.status(403).render('urls_not_authorized');
    }
  }
  return res.status(404).render('urls_nonexist');
  // shortURL not found in DB.
});
//===================================================//

//==============POST: DELETE URLS=================//
//  if the user logged in is the creator of the link,
//  they can delete the entire item from the user
//  Database.
app.post('/urls/:shortURL/delete', auth, (req, res) => {
  let email = req.session.email;
  let shortURL = req.params.shortURL
  if(email === userDatabase[email].email) {
    delete userDatabase[email].urls[shortURL];
    res.redirect('/urls');
  } else {
    res.redirect('/')
  }
});
//===================================================//

//=================POST: EDIT URLS====================//
//  this page allows the logged in user to edit the
//  ULR associated with a Short URL. it checks to make sure
//  logged in email is the same as the email who created
//  the link.
app.post('/urls/:shortURL/update', auth, (req, res) => {
  let email = req.session.email;
  let shortURL = req.params.shortURL;
  let newURL = req.body.newURL;
  if(email === userDatabase[email].email) {
    userDatabase[email].urls[shortURL] = req.body.newURL;
    res.redirect('/urls');
  } else {
    res.redirect('/');
  }
});
//===================================================//

//================SHORT URL GENERATOR===============//
//  creates a randomized 6 character string to be used
//  as a short URL.

function generateRandomString() {
  let rand = '';
  let possible = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  for( var i = 0; i < 6; i+= 1 ) {
    rand += possible.charAt(Math.floor(Math.random() * possible.length))
  };
return rand;
}
//===================================================//

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});

const express = require("express");
const app = express();
const PORT = 8080; // default port 8080
const bcrypt = require('bcrypt');
const saltRounds = 10;
const {getUserByEmail, generateRandomString, urlsForUserId} = require('./helpers');
const d = new Date().toLocaleString("en-US", {timeZone: "America/New_York"}).split(',')[0];

app.set("view engine", "ejs");

const cookieSession = require('cookie-session');
app.use(cookieSession({
  name: 'session',
  keys: ['summer']
}));

//url database
const urlDatabase = {
  b6UTxQ: { longURL: "https://www.tsn.ca", userID: "aJ48lW" },
  i3BoGr: { longURL: "https://www.google.ca", userID: "aJ48lW" }
};

//users database
const users = {};

const bodyParser = require("body-parser");
app.use(bodyParser.urlencoded({extended: true}));


app.get("/urls.json", (req, res) => {
  res.json(urlDatabase);
});

app.get("/", (req, res) => {
  if (req.session.id) {
    return res.redirect("/urls");
  }
  res.redirect("/login");
});

app.get("/urls", (req, res) => {
  const userId = req.session.id;
  const user = users[userId];
  const templateVars = {
    urls: urlsForUserId(userId, urlDatabase),
    user,
    date: d
  };
  if (userId) {

    return res.render('urls_index', templateVars);
  }
  res.status(401).send("Please login!");

});

app.get("/urls/new", (req, res) => {
  const user_id = req.session.id;
  const user = users[user_id];
  const templateVars = {
    urls: urlDatabase,
    user
  };

  if (user_id) {
    return res.render("urls_new", templateVars);
  }
  res.redirect("/login");
  
});

//display urls belonged to user
app.get("/urls/:shortURL", (req, res) => {
  const userId = req.session.id;
  const user = users[userId];
  const shortURL = req.params.shortURL;
  const userIdURL = urlsForUserId(userId, urlDatabase);
  const templateVars = {
    shortURL,
    longURL: urlDatabase[shortURL].longURL,
    user,
    urlDatabase
  };
  
  if (!userId || !userIdURL[shortURL]) {
    return res.status(401).send("You are not allowed!");
  }
  res.render('urls_show', templateVars);
});

//redirect shortURL to longURL
app.get("/u/:shortURL", (req, res) => {
  const user_id = req.session.id;
  const user = users[user_id];
  const templateVars = {
    urls: urlDatabase,
    user
  };
  if (urlDatabase[req.params.shortURL]) {
    return res.redirect(urlDatabase[req.params.shortURL].longURL);
  } 
  res.status(404).send("Page not Found!");

});

//generate short urls and associate with user
app.post("/urls", (req, res) => {
  const userId = req.session.id;
  if (userId) {
    const newURL = generateRandomString();
    //generate random shortURL
    urlDatabase[newURL] = {
      "longURL": req.body.longURL,
      "userID": userId
    }; //add new generated shortURL to longURL
    return res.redirect(`/urls/${newURL}`);
  }
  res.status(401).send("Please log in!");
});

// edit url
app.post("/urls/:id", (req, res) => {
  const shortURL = req.params.id;
  const userId = req.session.id;
  if (!userId) {
    res.send("You are not authorized!");
  }
  
  const userURL = urlsForUserId(userId, urlDatabase);

  if (userURL !== {}) {
    urlDatabase[shortURL].longURL = req.body.longURL;
    return res.redirect("/urls");
  }
  res.send("You are not allowed!");
});

//delete url
app.post("/urls/:shortURL/delete", (req, res) => {
  const userId = req.session.id;
  if (!userId) {
    res.send("You are not authorized!");
  }
  const shortURL = urlsForUserId(userId, urlDatabase);
  
  if (shortURL !== {}) {
    delete urlDatabase[req.params.shortURL];
    return res.redirect('/urls');
  }
  res.send("You are not authorized!");
});

//GET /login
app.get("/login", (req, res) => {
  const user_id = req.session.id;
  const user = users[user_id];
  const templateVars = {
    urls: urlDatabase,
    user
  };
  if (user_id) {
    return res.redirect("/urls");
  }
  res.render("urls_login", templateVars);
});

// ----user login ----
app.post("/login", (req, res) => {
  const userEmail = req.body.email;
  const userPassword = req.body.password;
  const user = getUserByEmail(userEmail, users);

  if (!user) {

    return res.status(403).send("Email cannot be found");
  }
  if (user) {
    if (bcrypt.compareSync(userPassword, user.password)) {
      req.session.id = user.id;
      return res.redirect("/urls");
    }
  }
  res.status(403).send("Email or password not matching");
});

app.post("/logout", (req, res) => {
  req.session['id'] = null;
  res.redirect("/urls");
});

//----registrations----

app.get("/register", (req, res) => {
  const user_id = req.session.id;
  const user = users[user_id];
  const templateVars = {
    urls: urlDatabase,
    user
  };
  res.render("urls_registration", templateVars);
});

app.post("/register", (req,res) => {
  const userID = generateRandomString();
    
  const userEmail = req.body.email;
  const userPassword = req.body.password;

  if (userEmail === "" || userPassword === "") {
    res.status(400).send("Please fill in email and password");
  }
  if (!getUserByEmail(userEmail, users)) {
    users[userID] = {
      id: userID,
      email: userEmail,
      password: bcrypt.hashSync(userPassword,saltRounds)
    };
    req.session.id = userID;
    return res.redirect("/urls");
  }
  res.status(400).send("Already registered with this email address.");
  
});


app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});
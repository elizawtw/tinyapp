const express = require("express");
const app = express();
const cookieParser = require("cookie-parser");
const PORT = 8080; // default port 8080

app.set("view engine", "ejs");

app.use(cookieParser());
const urlDatabase = {
  "b2xVn2": "http://www.lighthouselabs.ca",
  "9sm5xK": "http://www.google.com"
};

//users database
const users = {}


const bodyParser = require("body-parser");
app.use(bodyParser.urlencoded({extended: true}));

app.get("/", (req, res) => {
  res.send("Hello!");
});

//find existing email from users object
const getUserEmail = function (email, obj) {
  for(const user in obj) {
    if(obj[user].email === email) {
     return obj[user].email;
    }
  } return undefined;
}

//generate random URL or ID
function generateRandomString() {
  let uniqueURL = '';
  const str = '0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ';
  for (let i = 6; i > 0; i--) {
    uniqueURL += str[Math.floor(Math.random() * str.length)]
  }
  return uniqueURL;
}

app.get("/urls.json", (req, res) => {
  res.json(urlDatabase);
});


app.get("/urls", (req, res) => {
  const user_id = req.cookies["id"];
  const user = users[user_id]
  const templateVars = { 
    urls: urlDatabase, 
    user
  };
  
  res.render('urls_index', templateVars)
});

app.get("/urls/new", (req, res) => {
  const user_id = req.cookies["id"];
  const user = users[user_id]
  const templateVars = { 
    urls: urlDatabase, 
    user
  };
  res.render("urls_new", templateVars);
  
});

app.get("/urls/:shortURL", (req, res) => {
  const user = req.cookies["id"];
  const templateVars = { 
    shortURL: req.params.shortURL, 
    longURL: urlDatabase[req.params.shortURL],
    user
  };
  
  
  res.render('urls_show', templateVars)
});

app.get("/u/:shortURL", (req, res) => {
  const templateVars = { 
    shortURL: req.params.shortURL, 
    longURL: urlDatabase[req.params.shortURL]
  };
  const newLongURL = urlDatabase[req.params.shortURL];
  res.redirect(newLongURL);  
 
});

//registrations
app.get("/register", (req, res) => {
  const user_id = req.cookies["id"];
  const user = users[user_id]
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
    console.log('empty string');
    res.status(400).send("Please fill in email and password");
  }
  if(!getUserEmail(userEmail, users)) {
    users[userID] = {
      id: userID,
      email: req.body.email,
      password: req.body.password
    };
    res.cookie("id", userID);
    res.redirect("/urls");
  }
  return res.status(400).send("Already registered with this email address.")
  
})

app.post("/urls", (req, res) => {
  const newURL = generateRandomString();  //generate random shortURL
  urlDatabase[newURL] = req.body.longURL; //add new generated shortURL to longURL
  res.redirect(`/urls/${newURL}`);
  
});

// edit url
app.post("/urls/:id", (req, res) => {
  const shortURL = req.params.id;
  urlDatabase[shortURL] = req.body.longURL;
  
  res.redirect("/urls");
})

//delete url
app.post("/urls/:shortURL/delete", (req, res) => {
  
  delete urlDatabase[req.params.shortURL];
  res.redirect(`/urls`);
  
});
//user login
app.post("/login", (req, res) => {
  res.cookie("id", users.userID);
  res.redirect("/urls");
});

app.post("/logout", (req, res) => {
  res.clearCookie("id");
  res.redirect("/urls");
})

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});
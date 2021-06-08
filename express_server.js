const express = require("express");
const app = express();
const PORT = 8080; // default port 8080

app.set("view engine", "ejs");

const urlDatabase = {
  "b2xVn2": "http://www.lighthouselabs.ca",
  "9sm5xK": "http://www.google.com"
};

const bodyParser = require("body-parser");
app.use(bodyParser.urlencoded({extended: true}));
app.get("/", (req, res) => {
  res.send("Hello!");
});

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

app.get("/hello", (req, res) => {
  res.send("<html><body>Hello <b>World</b></body></html>\n");
});

app.get("/urls", (req, res) => {
  const templateVars = { urls: urlDatabase};
  
  res.render('urls_index', templateVars)
});

app.get("/urls/new", (req, res) => {
  res.render("urls_new");
  console.log(res.statusCode);
});

app.get("/urls/:shortURL", (req, res) => {
  const templateVars = { shortURL: req.params.shortURL, longURL: urlDatabase[req.params.shortURL]};
  
  res.render('urls_show', templateVars)
});

app.get("/u/:shortURL", (req, res) => {
  const templateVars = { shortURL: req.params.shortURL, longURL: urlDatabase[req.params.shortURL]};
  const newLongURL = urlDatabase[req.params.shortURL];
  res.redirect(newLongURL);  
 
});

app.post("/urls", (req, res) => {
  const newURL = generateRandomString();  //generate random shortURL
  urlDatabase[newURL] = req.body.longURL; //add new generated shortURL to longURL
  res.redirect(`/urls/${newURL}`);
  
});
//delete url
app.post("/urls/:shortURL/delete", (req, res) => {
  
  delete urlDatabase[req.params.shortURL];
  
  res.redirect(`/urls`);
  
});

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});
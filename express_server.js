const express = require("express");
const app = express();
const cookieParser = require("cookie-parser");
const PORT = 8080; // default port 8080
const bcrypt = require('bcrypt');
const saltRounds = 10;

app.set("view engine", "ejs");

app.use(cookieParser());
const urlDatabase = {
  b6UTxQ: { longURL: "https://www.tsn.ca", userID: "aJ48lW" },
  i3BoGr: { longURL: "https://www.google.ca", userID: "aJ48lW" }
};

//users database
const users = {
  "123tyu": {
    id: "123tyu",
    email: "alizawong@gmail.com",
    password: "1234abc"
  }
};


const bodyParser = require("body-parser");
app.use(bodyParser.urlencoded({extended: true}));

app.get("/", (req, res) => {
  res.send("Hello!");
});

//Function - find existing email from users object
const getUserEmail = function (email, obj) {
  for(const item in obj) {
    const user = obj[item];
    if(user.email === email) {
     return user;
    }
  } return null;
}

//Function - generate random URL or ID
function generateRandomString() {
  let uniqueURL = '';
  const str = '0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ';
  for (let i = 6; i > 0; i--) {
    uniqueURL += str[Math.floor(Math.random() * str.length)]
  }
  return uniqueURL;
}

//Function - return urls where the userID is equal to id of currently logged in user
const urlsForUserId = function(id, database) {
  let urlsUserId =  {};
  for(const shortURL in database) {
    if(database[shortURL].userID === id) {
      urlsUserId[shortURL] = database[shortURL];
    }
  } return urlsUserId;
}


app.get("/urls.json", (req, res) => {
  res.json(urlDatabase);
});


app.get("/urls", (req, res) => {
  const userId = req.cookies["id"];
  const user = users[userId]
  const templateVars = { 
    urls: urlsForUserId(userId, urlDatabase), 
    user
  };
  return res.render('urls_index', templateVars);

});

app.get("/urls/new", (req, res) => {
  const user_id = req.cookies["id"];
  const user = users[user_id]
  const templateVars = { 
    urls: urlDatabase, 
    user
  };

  if (user_id) {
   return res.render("urls_new", templateVars);
  }
  res.redirect("/login");
  
});

app.get("/urls/:shortURL", (req, res) => {
  const user = req.cookies["id"];
  const templateVars = { 
    shortURL: req.params.shortURL, 
    longURL: urlDatabase[req.params.shortURL].longURL,
    user
  };
  const userIdURL = urlsForUserId(user, urlDatabase);
  if (userIdURL) {
    return res.render('urls_show', templateVars);
  }
  res.send("Please log in!")
});

app.get("/u/:shortURL", (req, res) => {
  const user_id = req.cookies["id"];
  const user = users[user_id]
  const templateVars = { 
    urls: urlDatabase, 
    user
  }
  res.redirect(urlDatabase[req.params.shortURL].longURL);  
 
});
//GET /login
app.get("/login", (req, res) => {
  const user_id = req.cookies["id"];
  const user = users[user_id]
  const templateVars = { 
    urls: urlDatabase, 
    user
  };
  res.render("urls_login", templateVars)
})

//----registrations----

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
      email: userEmail,
      password: bcrypt.hashSync(userPassword,saltRounds)
    };
    console.log('registration', users[userID])
    res.cookie("id", userID);
    return res.redirect("/urls");
  }
   res.status(400).send("Already registered with this email address.")
  
})

app.post("/urls", (req, res) => {
  const newURL = generateRandomString();  //generate random shortURL
  const userId = req.cookies["id"];
  urlDatabase[newURL] = {
    "longURL": req.body.longURL,
    "userID": userId
}; //add new generated shortURL to longURL

  res.redirect(`/urls/${newURL}`);
  
});

// edit url
app.post("/urls/:id", (req, res) => {
  const shortURL = req.params.id;
  const userId = req.cookies["id"]
  if (!userId) {
    res.send("You are not authorized!");
  }
  
  const userURL = urlsForUserId(userId, urlDatabase);

  if (userURL !== {}) {
    urlDatabase[shortURL].longURL = req.body.longURL;
    return res.redirect("/urls");
  }
  res.send("You are not allowed!")
})

//delete url
app.post("/urls/:shortURL/delete", (req, res) => {
  const userId = req.cookies["id"]
  if (!userId) {
    res.send("You are not authorized!");
  }
  const shortURL = urlsForUserId(userId, urlDatabase);
  
  if(shortURL !== {}) {
    delete urlDatabase[req.params.shortURL];
    return res.redirect('/urls');
  }
  res.send("You are not authorized!");
});

// ----user login ----
app.post("/login", (req, res) => {
  const userEmail = req.body.email;
  const userPassword = req.body.password;
  const user = getUserEmail(userEmail, users);
  console.log('login',user)
  console.log('login password', user.password)
  if(!user) {
    return res.status(403).send("Email cannot be found");
  }
  if (user) {
    if (bcrypt.compareSync(userPassword, user.password)) {
      req.body.id = user.id;
      res.cookie("id", user.id);
      return res.redirect("/urls");
    }
  }
    res.status(403).send("Email or password not matching");
});

app.post("/logout", (req, res) => {
  res.clearCookie("id");
  res.redirect("/urls");
})

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});
//Function - find existing email from users object
const getUserByEmail = function (email, obj) {
  for(const item in obj) {
    const user = obj[item];
    if(user.email === email) {
     return user;
    }
  } return undefined;
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


module.exports = { getUserByEmail, generateRandomString, urlsForUserId };
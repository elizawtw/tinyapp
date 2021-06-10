//Function - find existing email from users object
const getUserByEmail = function (email, obj) {
  for(const item in obj) {
    const user = obj[item];
    if(user.email === email) {
     return user;
    }
  } return undefined;
}

module.exports = {getUserByEmail };
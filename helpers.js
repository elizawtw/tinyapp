//Function - find existing email from users object
const getUserByEmail = function (email, obj) {
  for(const item in obj) {
    const user = obj[item];
    if(user.email === email) {
      console.log('success function');
      console.log('function', user)
     return user;
    }
  } return null;
}

module.exports = {getUserByEmail };
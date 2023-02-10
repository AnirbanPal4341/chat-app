const userService = require('../auth/user-db/user');
const jwt = require("jsonwebtoken");

async function validateUser(username,password) {
    const user = await userService.findOne(username);
    let token='';
    if(!user){
        return null;
    }
    if(user.password != password){
        return null;
    }
    else{
        try {
            //Creating jwt token
            token = jwt.sign(
              { username: user.username, id: user.id },
              "super-secret",
              { expiresIn: "1h" }
            );
          } catch (err) {
            console.log(err);
            const error = new Error("Error! Something went wrong.");
            return null;
          }

          return {msg: "User authenticated!",username: username, token: token};
    }
}

module.exports= {validateUser} ;
  
const jwt = require("jsonwebtoken");
const {redisClient} = require("../Redis/redis");
const authenticator = async (req, res, next) => {
    const token = req.headers?.authorization
    let tokenPresent = await redisClient.get(token)
    if(tokenPresent){
         res.send("please login")
        }

    else{
        jwt.verify(token,process.env.token_key,(err,decode)=>{
            if(err) {
                res.send("token is not valid")
            }
            else{
                next()
            }
        })
    }
};
module.exports = {
    authenticator
}
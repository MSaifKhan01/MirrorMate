require("dotenv").config();
const jwt = require("jsonwebtoken");
const fs = require("fs");
const {redis} = require("../config/redis")
const { tokenModel } = require("../config/blacklistSchema");

const validator = (req, res, next) => {
  token = req.headers.authorization ? req.headers.authorization.split(" ")[1] : undefined;
  jwt.verify(req.cookies.token, process.env.token_key, (err, decoded) => {
    if (err) {
      console.log(req.headers.authorization);
      if (err.expiredAt && token) {
        console.log("yes");
        jwt.verify(token, process.env.refresh_key, async (err, decoded) => {
          if (err) {
            res
              .status(401)
              .json({ error: `please login again your token is not valid` });
          } else {
            if ( await redis.get(req.body.name) || await tokenModel.findOne({ token }))  {
              res
                .status(403)
                .json({ error: `please login you are in blacklist` });
            } else {
              let token = jwt.sign(
                { user: decoded.user, id: decoded.id.id, role: decoded.role },
                process.env.token_key,
                { expiresIn: "6s" }
              );
              res.cookie("token", token);
              req.body.user = decoded.user;
              req.body.id = decoded.id;
              req.body.role = decoded.role;
              next();
            }
          }
        });
      } else {
        res
          .status(406)
          .json({ error: `please login again your token is not valid` });
      }
    } else {
      console.log("simple token");
      req.body.user = decoded.user;
      req.body.id = decoded.id;
      req.body.role = decoded.role;
      next();
    }
  });
};

const authorization = (req, res, next) => {
  const allRoles = JSON.parse(fs.readFileSync("./permition.json", "utf-8"));
  if (
    req.body.role &&
    allRoles[req.body.role] &&
    allRoles[req.body.role].permitedMethod.includes(req.method) &&
    allRoles[req.body.role].permitedRoutes.includes(req.url)
  ) {
    next();
  } else {
    res.status(403).json({ error: `you are not authorized` });
  }
};

module.exports = { validator, authorization };

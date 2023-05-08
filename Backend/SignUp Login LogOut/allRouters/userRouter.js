//-----------  All the Requirements/Imports Here  -----------------------------
const express = require("express");
const jwt = require("jsonwebtoken");
const { validator, authorization } = require("../middleware/midleware"); 

require("dotenv").config();
const sgMail = require("@sendgrid/mail");
let globe_opt;
const { v4: uuidv4 } = require("uuid");
const fetch = (...args) =>
import("node-fetch").then(({ default: fetch }) => fetch(...args));
const { userModel } = require("../config/userSchema");
const { tokenModel } = require("../config/blacklistSchema");
const { passport } = require("../config/google.auth");
const bcrypt = require("bcrypt");
const userRouer = express.Router();
const {redis} = require("../config/redis")
userRouer.use(express.json());

//------------------- Google Auth Here -----------------------------------------
userRouer.get(
  "/auth/google",
  passport.authenticate("google", { scope: ["profile", "email"] })
);

userRouer.get(
  "/auth/google/callback",
  passport.authenticate("google", {
    failureRedirect: "/login",
    session: false,
  }),
  async function (req, res) {
    const fetch_user = await userModel.findOne({ email: req.user.email });
    if (fetch_user) {
      token_Genretor(res, fetch_user.name, fetch_user._id, fetch_user.role);
    } else {
      req.user.password = bcrypt.hashSync(req.user.password, 2);
      const user = new userModel(req.user);
      await user.save();
      token_Genretor(res, req.user.name, "login with google", "customer");
      
    }
  }
);

//---------------- GitHub Auth Here --------------------------------------------
userRouer.get("/auth/github", (req, res) => {
  res.redirect(
    `https://github.com/login/oauth/authorize?client_id=${process.env.GITHUB_CLIENT_ID}&scope=user:email`
  );
});
userRouer.get("/auth/github/callback", async (req, res) => {
  const { code } = req.query;
  const acces_Token = await fetch(
    "https://github.com/login/oauth/access_token",
    {
      method: "POST",
      headers: {
        Accept: "application/json",
        "content-type": "application/json",
      },
      body: JSON.stringify({
        client_id: process.env.GITHUB_CLIENT_ID,
        client_secret: process.env.GITHUB_CLIENT_SECRET,
        code,
      }),
    }
  ).then((res) => res.json());
  const user = await fetch("https://api.github.com/user", {
    method: "GET",
    headers: {
      Authorization: `Bearer ${acces_Token.access_token}`,
      "content-type": "application/json",
    },
  }).then((res) => res.json());
  const user_Email = await fetch("https://api.github.com/user/emails", {
    method: "GET",
    headers: {
      Authorization: `Bearer ${acces_Token.access_token}`,
      "content-type": "application/json",
    },
  }).then((res) => res.json());
  let user_details = {
    name: user.name,
    email: user_Email[0].email,
    password: uuidv4(),
    avtar: user.avatar_url,
    role: "custemer",
  };
  const fetch_user = await userModel.findOne({ email: user_details.email });
  if (fetch_user) {
    token_Genretor(res, fetch_user.name, fetch_user._id, fetch_user.role);
  } else {
    user_details.password = bcrypt.hashSync(user_details.password, 2);
    const user = new userModel(user_details);
    await user.save();
    token_Genretor(res, user_details.name, "login with github", "customer");
  }
});

//------------- Signup User Routes ---------------------------------------------
userRouer.post("/signup", async (req, res) => {
  try {
    if (await userModel.findOne({ email: req.body.email })) {
      res.status(406).json({ error: `user is alredy present.` });
    } else {
      req.body.password = bcrypt.hashSync(req.body.password, 2);
      const user = userModel(req.body);
      await user.save();
      res.status(202).json({ msg: `user is created.` });
    }
  } catch (err) {
    res.status(500).send({ err: err.message });
  }
});
userRouer.post("/login", async (req, res) => {
  try {
    let user = await userModel.findOne({ email: req.body.email });
    if (user.email) {
      if (await bcrypt.compare(req.body.password, user.password)) {

        res.send({msg: "ok"})
      } else {
        res.status(406).json({ error: `user password is worng..` });
      }
    } else {
      res.status(406).json({ msg: `user email is worng..` });
    }
  } catch (err) {
    res.status(500).send({ err: err.message });
  }
});
userRouer.post("/logout", async (req, res) => {
  try {
    token = req.headers.authorization.split(" ")[1];
    if (checkInredis (req.body.name,token) || await tokenModel.findOne({ token })) {
      res.status(405).json({ error: `you are  alredy blacklisted or logout` });
    } else {
      const user = tokenModel({ token });
      await user.save();
      redis.set(req.body.name,token)
      redis.EXPIRE(req.body.name,2000)
      console.log("redis set",token );
      res.status(202).json({ msg: `user logout successfully` });
    }
  } catch (err) {
    res.status(500).send({ err: err.message });
  }
});
userRouer.post("/email/forgot", async (req, res) => {
  try {
    if (await userModel.findOne({ email: req.body.email })) {
      globe_opt = Math.floor(Math.random() * 1000000);
      sgMail.setApiKey(process.env.SendGrid_Key);
      const msg = {
        to: req.body.email,
        from: "mmehra851@gmail.com",
        subject: "Reset you Password for Mirror Mate App",
        text: `Your OTP is ${globe_opt}`,
      };
      await sgMail.send(msg);
      res.status(202).json({ msg: `OTP sent on Email` });
    } else {
      res.status(406).json({ error: `Email not registered.` });
    }
  } catch (err) {
    res.status(500).send({ err: err.message });
  }
});
userRouer.post("/forgot", async (req, res) => {
  try {
    if (req.body.otp == globe_opt) {
      let user = await userModel.findOne({ email: req.body.email });
      req.body.password = bcrypt.hashSync(req.body.password, 2);
      await userModel.findByIdAndUpdate(
        { _id: user._id },
        { password: req.body.password }
      );
      res.status(202).send({ msg: `Password is updated succesfully.` });
    } else {
      res.status(400).json({ error: `wrong opt` });
    }
  } catch (err) {
    res.status(500).send({ err: err.message });
  }
});

//----------------Functions Here -----------------------------------

function token_Genretor(res, name, id, role) {
  let token = jwt.sign(
    { user: name, id: id, role: role },
    process.env.token_key,
    { expiresIn: "6s" }
  );
  let refreshToken = jwt.sign(
    { user: name, id: id, role: role },
    process.env.refresh_key,
    { expiresIn: "120s" }
  );
  res.cookie("token", token);
  res.redirect("http://127.0.0.1:5501/Frontend/dashboard.html")
  // res.status(202).json({ refreshToken });
}

function checkInredis (key , token){
  redis.get(key, (err, result) => {
    if (err) {
      return false
    } else {
      return result == token
    }
  });
}
//-------------------- All exports ---------------------------------------------
module.exports = { userRouer };

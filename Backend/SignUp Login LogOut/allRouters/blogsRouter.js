const express = require("express");
const { authorization } = require("../middleware/midleware");
require("dotenv").config();

const blogeRouter = express.Router();
blogeRouter.use(express.json());

blogeRouter.get(
  "/",
  authorization,
  (req, res) => {
    res.send("bloge get");
  }
);

blogeRouter.post("/", authorization, (req, res) => {
  res.send("bloge post");
});

blogeRouter.patch(
  "/",
  authorization,
  (req, res) => {
    res.send("bloge patch");
  }
);

blogeRouter.delete("/", authorization, (req, res) => {
  res.send("bloge del");
});

module.exports = { blogeRouter };

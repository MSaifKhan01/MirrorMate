require("dotenv").config();
const cors = require("cors");
const { connection } = require("./config/db");
const { userRouer } = require("./allRouters/userRouter");

const { validator } = require("./middleware/midleware");
const cookieParser = require("cookie-parser");
const winston = require("winston");
const expressWinston = require("express-winston");
const express = require("express");

const app = express();

app.use(express.json());
app.use(cookieParser());
app.use(cors({
  origin: "*"
}));

// winston logging
app.use(expressWinston.logger({
  transports: [
    new winston.transports.File({
      filename: 'file.log',
      level:"info"
    }),
  ],
  format: winston.format.combine(
    winston.format.colorize(),
    winston.format.json(),
    winston.format.prettyPrint()
  ),
}));

app.use(expressWinston.errorLogger({
  transports: [
    new winston.transports.Console({
      level:"errer"
    })
  ],
  format: winston.format.combine(
    winston.format.colorize(),
    winston.format.json(),
    winston.format.prettyPrint()
  ),
}));


app.use("/user", userRouer);


app.get("/", (req, res) => {
  try{
    res.send({ msg: `This is Home Page` });
  }catch(err){
    logger.error(err)
  }
});

app.listen(process.env.PORT, async () => {
  try {
    connection;
    console.log(`connected to mongo db ...`);
  } catch (err) {
    console.log({ err: err.message });
  }
  console.log(`server is runing on ${process.env.PORT}`);
});

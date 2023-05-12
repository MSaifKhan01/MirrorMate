const express = require("express")
const cors = require("cors");
const app  = express();
const {connection} = require("./config/db");
const {userRouter} = require("./routes/userRoute");


require("dotenv").config();

app.use(cors());
app.use(express.json());


require("dotenv").config();

app.get("/", (req, res) => {
     res.send("welcome to home page")
})

app.use("/user", userRouter)
app.listen(process.env.port, async () => {
     try {
          await connection
          console.log("connected to mongoAtlas ")
     } catch (err) {
          console.log({ err: err.message })
     }
     console.log(`server is running at ${process.env.port} .....`)
})
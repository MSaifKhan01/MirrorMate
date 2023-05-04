const express=require('express');
require('dotenv').config();
const { v4: uuidv4 } = require('uuid');

const app=express();
app.use(express.json())
app.set("view engine","ejs")
app.use(express.static('public'))


app.get('/',(req,res)=>{
    res.redirect(`/${uuidv4()}`)
})

app.get('/:room',(req,res)=>{
    res.render("room",{roomId: req.params.room})
})


const port=process.env.PORT||8080
const server=app.listen(port,()=>{
    console.log(`Video Call Server is running at PORT ${port}`)
})

const io=require('socket.io')(server)

io.on('connection',(socket)=>{
    console.log("New Connection at "+socket.id)
})
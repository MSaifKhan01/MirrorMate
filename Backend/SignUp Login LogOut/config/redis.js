const ioRedis=require("ioredis")
require("dotenv").config()
let configuration={
    host: process.env.redisHost,
    port: process.env.redisPort,
    username:"default",
    password:process.env.redisPassword
}
const redis=new ioRedis(configuration)
module.exports={
    redis
}
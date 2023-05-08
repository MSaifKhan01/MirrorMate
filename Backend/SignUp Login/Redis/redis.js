const ioRedis=require("ioredis")
require("dotenv").config()
let configuration={
    host:"redis-12728.c301.ap-south-1-1.ec2.cloud.redislabs.com",
    port:12728,
    username:"default",
    password:process.env.password
}
const redisClient=new ioRedis(configuration)
module.exports={
    redisClient
}
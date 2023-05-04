
const chatBtn = document.getElementById("chat-form");
const chatMessages = document.querySelector(".chat-messages");
const roomName = document.getElementById("room-name");
const  userList = document.getElementById("users");

const urlParams =  new URLSearchParams(window.location.search)

const username = urlParams.get('username');
const room = urlParams.get("room");



const socket = io("http://localhost:8081/",{transports:["websocket"]});
// const socket = io();

socket.emit("joinRoom",({username,room}));




socket.on("roomname",(room)=>{
    let para=document.createElement("p")
    para.innerText=`Room Name :- ${room}`
   //  console.log(room)
   roomName.append(para)
   })







socket.on("message",(message)=>{
    // outputMessage(message);
    DispalyMessage(message)

})



// Sending message

// chatForm.addEventListener("submit",(e)=>{
//     e.preventDefault()

//     let msg  = e.target.elements.msg.value;

//     msg  = msg.trim();

//     if(!msg){
//         return false;
//     }

//     socket.emit('chatMessage',msg);
//     e.target.elements.msg.value = "";
//     e.target.elements.msg.focus();

// })




let inputel=document.getElementById("msg")

chatBtn.addEventListener("click",(e)=>{
    e.preventDefault()
    let msg=inputel.value
    socket.emit("chatmessage",msg)
    msg=""
})

// socket.on("roomUsers",({room,users})=>{

//     roomName.innerText= room;

// outputRoomUsers(users)

// })


// function outputRoomUsers(users){
    
//     userList.innerHTML = '';

//     users.forEach(user => {
//         const li = document.createElement("li");
//         li.innerText = user.username;
//         userList.appendChild(li)
//     });
// }

socket.on("allusers",(users)=>{
    // userList.innerHTML=""
    users.forEach(ele => {
        let list=document.createElement("li")
        list.innerText=ele.username
        userList.append(list)
    });
})




//outPut message

// function outputMessage(message){

//     const div = document.createElement("div");
//     div.classList.add("message");

//     const p = document.createElement("p");

//     p.classList.add("meta");

//     p.innerText = message.username;

//     p.innerHTML += `<span>${message.time}</span>`;

//     div.appendChild(p);

//     const para = document.createElement("p");

//     para.classList.add("text");
//     para.innerText = message.text;


//     div.appendChild(para);
//     chatMessages.appendChild(div);
    

// }



function  DispalyMessage(message){
    let div=document.createElement("div")
    const name=document.createElement("h5")
    name.innerText=message.username
// console.log(message.username,message.text,message.time)
    let text=document.createElement("h6")
    text.innerText=message.text
    let time=document.createElement("p")
    time.innerText=message.time

    div.append(name,text,time)

    chatMessages.append(div)
}
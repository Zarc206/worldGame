const express = require('express')
const app = express()
const port = 3000

//socket.io setup
const http = require('http')
const server = http.createServer(app)
const { Server } = require('socket.io')
const io = new  Server(server,{pingInterval: 2000, pingTimeout: 5000 })

let playerSpeed = 5

app.use(express.static('public'))

app.get('/', (req, res) => {
  res.sendFile(__dirname + '/index.html')
})


players = {}

serverTick = 0

objectMap = [
             [1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1],
             [1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1],
             [1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1],
             [1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1],
             [1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1],
             [1,1,1,1,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1,1,1,1,1], 
             [1,1,1,1,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1,1,1,1,1],   
             [1,1,1,1,1,0,0,0,0,1,1,1,1,1,0,0,0,0,0,0,0,0,0,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1,1,1,1,1],
             [1,1,1,1,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1,1,1,1,1],   
             [1,1,1,1,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1,0,0,0,0,0,0,0,0,0,1,1,1,1,1],   
             [1,1,1,1,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1,0,0,0,0,0,0,0,0,0,1,1,1,1,1],   
             [1,1,1,1,1,0,0,0,0,4,0,0,0,0,0,0,0,0,0,0,0,0,0,1,1,1,1,1,1,1,0,0,0,1,0,0,0,0,0,0,0,0,0,1,0,0,0,0,0,0,0,0,0,1,1,1,1,1],   
             [1,1,1,1,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1,0,0,0,0,0,0,0,0,0,1,1,1,1,1],   
             [1,1,1,1,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1,0,0,0,0,0,0,0,0,0,1,1,1,1,1],   
             [1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1,0,0,0,0,0,0,0,0,0,1,1,1,1,1],   
             [1,1,1,1,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1,1,1,1,1],   
             [1,1,1,1,1,0,0,0,0,0,0,0,0,0,0,0,0,0,1,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1,1,1,1,1],   
             [1,1,1,1,1,0,0,0,0,0,0,0,0,0,0,0,0,0,1,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1,1,1,1,1],   
             [1,1,1,1,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1,1,1,1,1],   
             [1,1,1,1,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1,1,1,1,1],   
             [1,1,1,1,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1,1,1,1,1],   
             [1,1,1,1,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1,1,1,1,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1,1,1,1,1],   
             [1,1,1,1,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1,1,1,1,1],   
             [1,1,1,1,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1,1,1,1,1],   
             [1,1,1,1,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1,1,1,1,1,1,1,1,1,1,1,1,1,1],   
             [1,1,1,1,1,0,0,0,0,0,0,0,0,0,0,0,1,1,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1,1,1,1,1],   
             [1,1,1,1,1,0,0,0,0,0,0,0,0,0,0,0,0,0,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1,1,1,1,1],   
             [1,1,1,1,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1,0,0,0,0,0,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1,1,1,1,1],   
             [1,1,1,1,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1,1,1,1,1],   
             [1,1,1,1,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1,1,1,1,1],   
             [1,1,1,1,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1,1,1,1,1,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1,1,1,1,1],   
             [1,1,1,1,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1,1,1,1,1],   
             [1,1,1,1,1,0,0,0,0,0,0,1,1,1,1,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1,1,1,1,1],   
             [1,1,1,1,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1,1,1,1,1],   
             [1,1,1,1,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1,0,0,0,0,0,0,0,0,0,1,0,0,0,0,1,0,0,0,0,0,0,0,1,1,1,1,1],   
             [1,1,1,1,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1,0,0,0,0,1,0,0,0,0,0,0,0,1,1,1,1,1],   
             [1,1,1,1,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1,0,0,0,0,1,0,0,0,0,0,0,0,1,1,1,1,1],   
             [1,1,1,1,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1,0,0,0,0,1,0,0,0,0,0,0,0,1,1,1,1,1],   
             [1,1,1,1,1,0,0,0,0,0,0,0,0,0,0,0,1,1,1,1,0,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1,0,0,0,0,1,0,0,0,0,0,0,0,1,1,1,1,1],   
             [1,1,1,1,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1,0,0,0,0,1,0,0,0,0,0,0,0,0,0,0,0,0,0,1,1,1,1,1,1,0,0,0,0,0,0,0,1,1,1,1,1],   
             [1,1,1,1,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1,1,1,1,1],   
             [1,1,1,1,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1,1,1,1,1],   
             [1,1,1,1,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1,1,1,1,1,1,0,0,0,0,0,0,0,0,1,1,1,1,1],   
             [1,1,1,1,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1,0,0,0,0,0,0,0,0,0,0,0,0,0,1,1,1,1,1],   
             [1,1,1,1,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1,0,0,0,0,0,0,0,0,0,0,0,0,0,1,1,1,1,1],   
             [1,1,1,1,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1,0,0,0,0,0,0,0,0,0,0,0,0,0,1,1,1,1,1],   
             [1,1,1,1,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1,0,0,0,0,0,0,0,0,0,0,0,0,0,1,1,1,1,1],   
             [1,1,1,1,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1,0,0,0,0,0,0,0,0,0,0,0,0,0,1,1,1,1,1],   
             [1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1],
             [1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1],
             [1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1],
             [1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1],

            ]



io.on('connection',(socket) =>{
  console.log('a user connected')

  socket.on('newPlayer', () =>{

    function generateSpawn(){
      xValue = -1 *Math.abs(Math.floor(Math.random() * objectMap[0].length - 15)) * 50
      yValue = -1 * Math.abs(Math.floor(Math.random() * objectMap.length  - 12)) * 50
      console.log(String(xValue)  +' ' + String(yValue))
    if (isColide(xValue,yValue)){
      generateSpawn()
    } else {
      players[socket.id] = {
        id: socket.id,
        x:xValue,
        y:yValue,
        status:'none',
        lastTrig: 'none',
        subTrig:'none',
        energy: 100,
        clas: "shooter"
      }
    }
    }
    generateSpawn()
    console.log('New player ' + players[socket.id].id)
  })
  socket.on('movePlayer',(direction,player2) =>{
    player = players[socket.id]
    moveMultiply = 1
    if (player.status == 'slow'){
      moveMultiply = 0.2
    }
    if (direction == 'up'){
      if (!(isColide(player.x,player.y + playerSpeed))){
        player.y += playerSpeed * moveMultiply
      }
    } else if (direction == 'down'){
      if (!(isColide(player.x,player.y - playerSpeed))){
        player.y -= playerSpeed* moveMultiply
      }
      } else if (direction == 'left'){
      if (!(isColide(player.x + playerSpeed,player.y))){
        player.x += playerSpeed* moveMultiply
      }
      } else if (direction == 'right'){
      if (!(isColide(player.x - playerSpeed,player.y))){
        player.x -= playerSpeed* moveMultiply
      }
      }
      if (isJumpColide(player.x,player.y)){
        if (direction == 'up'){
          if (!(isColide(player.x,player.y + playerSpeed * 20))){
            player.y += playerSpeed * 20
          }
        } else if (direction == 'down'){
          if (!(isColide(player.x,player.y - playerSpeed * 20))){
            player.y -= playerSpeed * 20
          }        
        } else if (direction == 'left'){
          if (!(isColide(player.x + playerSpeed * 20,player.y))){
            player.x += playerSpeed * 20
          }
        } else if (direction == 'right'){
          if (!(isColide(player.x - playerSpeed * 20,player.y))){
            player.x -= playerSpeed * 20 
          }        } 
      }

  })
  socket.on('triggerUse',(trig,lastKey,energy) =>{
    players[socket.id].energy = energy
    if (trig == 'camo'){
      players[socket.id].status = 'invisible' 
    } else {
      players[socket.id].status = 'none' 
    }

    if (trig == 'jumper'){
      jumpX = Math.floor((players[socket.id].x - 700) / -50)
      jumpY = Math.floor((players[socket.id].y - 400) / -50)
      objectMap[jumpY][jumpX] = 2

      function deleteObject (a,b){
        setTimeout(function(){
          objectMap[a][b] = 0
        },5000)
      }
      deleteObject(jumpY,jumpX)
    } else if (trig == 'wall'){
      xOff = 0
      yOff = 0
      jumpX = 0;
      jumpY = 0
      if (lastKey == 'w'){
        yOff = -1
      } else if (lastKey == 'a'){
        xOff = -1
      } else if (lastKey == 's'){
        yOff = 2
      } else if (lastKey == 'd'){
        xOff = 2
      } 
      jumpX = Math.floor((players[socket.id].x - 700) / -50) + xOff
      jumpY = Math.floor((players[socket.id].y - 400) / -50 ) + yOff
      function deleteObject (a,b){
        setTimeout(function(){
          objectMap[a][b] = 0
        },10000)
      }
      if (objectMap[jumpY][jumpX] == 0){
        objectMap[jumpY][jumpX] = 3
        deleteObject(jumpY,jumpX)

      }
       for (let i = 0; i < 2; i++){
        if (lastKey == 'w'){
         if (i == 0){
        xOff += 1
         } else {
          xOff -= 2
         }
        } else if (lastKey == 'a'){
          if (i == 0){
            yOff -= 1
             } else {
              yOff += 2
             }
        } else if (lastKey == 's'){
          if (i == 0){
            xOff += 1
             } else {
              xOff -= 2
             }
        } else if (lastKey == 'd'){
          if (i == 0){
            yOff -= 1
             } else {
              yOff += 2
             }
        } 
        jumpX = Math.floor((players[socket.id].x - 700) / -50) + xOff
      jumpY = Math.floor((players[socket.id].y - 400) / -50 ) + yOff
      function deleteObject (a,b){
        setTimeout(function(){
          objectMap[a][b] = 0
        },10000)
      }
      if (objectMap[jumpY][jumpX] == 0){
        objectMap[jumpY][jumpX] = 3
        deleteObject(jumpY,jumpX)

      }
       }
    
    } else if (trig == 'shoot'){
      if (players[socket.id].energy > 20){
      io.emit('createAttack',players[socket.id], trig, lastKey,socket.id)
      }
    }else if (trig == 'sword'){
      if (players[socket.id].energy > 10){
      io.emit('createAttack',players[socket.id], trig, lastKey,socket.id)
      }
    }else if (trig == 'scorpion'){
      if (players[socket.id].energy > 5){
      io.emit('createAttack',players[socket.id], trig, lastKey,socket.id)
      }
    }else if (trig == 'shield'){
      if (players[socket.id].energy > 1){
      io.emit('createAttack',players[socket.id], trig, lastKey,socket.id)
      }
    }else if (trig == 'sniper'){
      if (players[socket.id].energy > 70){
      io.emit('createAttack',players[socket.id], trig, lastKey,socket.id)
      }
    }else if (trig == 'shoot-lead'){
      if (players[socket.id].energy > 15){
      io.emit('createAttack',players[socket.id], trig, lastKey,socket.id)
      }
    }else if (trig == 'asteroid'){
      if (players[socket.id].energy > 30){
      io.emit('createAttack',players[socket.id], trig, lastKey,socket.id)
      }
    }
  })
  socket.on('updateTriggerKey',(key) =>{
    players[socket.id].lastTrig = key
  })
  socket.on('updateSubTrigger',(key) =>{
    players[socket.id].subTrig = key

  })
  socket.on('playerStatus',(playerStatus,time) =>{
    players[socket.id].status = playerStatus
   
    setTimeout(function(){
      players[socket.id].status = 'none'
    },time)
  })


  socket.on('disconnect',(reason) => {
    console.log(reason)
    delete players [socket.id]
  })
  socket.on('removePlayer',() =>{
    
    delete players [socket.id]
  })
})



function updateServer(){
    setTimeout(function(){
    for (id in players){
      currentPlayer = players[id]
      if (((currentPlayer.lastTrig == 'camo')||(currentPlayer.subTrig == 'camo'))&&(!(currentPlayer.energy < 1))){
        currentPlayer.status = 'invisible'
      } else if (currentPlayer.status == 'invisible'){
        currentPlayer.status = 'none'
      }
    }

    serverTick += 1;
    io.emit('updatePlayers',players,objectMap)

    updateServer()
  },10)
}
updateServer()


server.listen(port, () => {
  console.log(`Example app listening on port ${port}`)
})

function isColide(x,y){
  for (let row = 0; row < objectMap.length; row ++){
    for (let element = 0; element < objectMap[row].length; element++){
      if ((objectMap[row][element] == 1)|| (objectMap[row][element] == 3)){

        if ((x > element * -50 +650) &&
            (x < element* -50 + 650 + 100) && 
            (y > row * -50 + 350) &&
            (y < row * -50 + 350 +100) 
        ){
          return(true)
        }
      }
    }
  }
  return(false)
}
function isJumpColide(x,y){
  for (let row = 0; row < objectMap.length; row ++){
    for (let element = 0; element < objectMap[row].length; element++){
      if ((objectMap[row][element] == 2)){

        if ((x > element * -50 +650) &&
            (x < element* -50 + 650 + 100) && 
            (y > row * -50 + 350) &&
            (y < row * -50 + 350 +100) 
        ){
          return(true)
        }
      }
    }
  }
  return(false)
}

console.log("server  is did loaded");

const socket = io()
const canvas = document.querySelector('canvas');
const c = canvas.getContext('2d');canvas.width = 1440;
canvas.height = 900;

let keys = {
    w:{
        pressed:false
    },
    a:{
        pressed:false
    },
    s:{
        pressed:false
    },
    d:{
        pressed:false
    }
}
let lastKey = 'a'
let players = []
let projectiles = []
let melee = []
let shields = []
let moveLock = false
let inGame = false
let standbyUsername = " "
let playerClass = "shooter"
let currentUsername = "guest"
let inLoggin = false


triggerList = ['shoot','sword','shield','sniper','jumper','wall','camo','shoot-lead','radar','scorpion','asteroid','hound','cloak','teleport','lightning']
playerTriggers = ['shoot','scorpion','hound','sniper','jumper','shield','camo','radar']
classes = ["shooter","magenta","lime","yellow","orange","pink","blue"]

info = 'Controls: W = up, A = left, S = down, D = right, numbers 1-4 = Select main trigger, numbers 5-8 = Select sub trigger, O = Use main trigger, P = Use sub trigger'
infoTrigger = "Lmao you weren't supposed to get here. Reload the page and think about what youve done"

class Divobject {
    constructor({
        dimensions,
        color,
        position,
        id
    }){
        let divobject = document.createElement('div');
        divobject.style.left = position.x
        divobject.style.top = position.y
        divobject.style.width = dimensions.width
        divobject.style.height = dimensions.height
        divobject.style.background = color
        divobject.style.position = 'absolute'
        divobject.id = id
        
        document.body.append(divobject)
    }
}
class Drawing {
    constructor({
        dimensions,
        color,
        position,
        id,
        direction,
        attackType,
        lifespan
    }){
        this.dimensions = dimensions
        this.color = color
        this.position = position
        this.id = id
        this.direction = direction
        this.attackType = attackType
        this.lifespan = lifespan
    }   
    draw(){
        if (!(this.color == "none")){
        c.fillStyle = this.color
        c.fillRect(this.position.x,this.position.y,this.dimensions.width,this.dimensions.height)
        }
    }
    move(){
        let bulletSpeed = 0
        if (this.attackType == 'bullet'){
            bulletSpeed = 14
        }else if (this.attackType == 'snipe'){
            bulletSpeed = 40
        } else if (this.attackType == 'lightning'){
            bulletSpeed = 40
        }else if (this.attackType == 'shoot-lead'){
            bulletSpeed = 12
        }else if (this.attackType == 'asteroid'){
            bulletSpeed = 12
        }
        if (this.direction == 'a'){
            this.position.x += bulletSpeed
        } else if (this.direction == 'd'){
            this.position.x -= bulletSpeed
        } else if (this.direction == 'w'){
            this.position.y += bulletSpeed
        } else if (this.direction == 's'){
            this.position.y -= bulletSpeed
        }

        
    }
    
}
class Hitbox{
    constructor({
        position,dimensions,player
    }){
        this.dimensions = dimensions
        this.position = position
        this.player = player
    }
}

function startMenu(){
    inLoggin = false
    canvas.style.zIndex = 0
    canvas.style.backgroundColor = 'lime'
    c.fillStyle = 'black'
    c.font = '50px arial'
    c.fillText("Game Battle",600,200)
    c.font = '20px arial'
    c.fillText(currentUsername,150,20)

    let startButton = new Divobject({
        color: 'yellow',
        dimensions:{
            width: 200,
            height:100
        },
        position:{
            x:640,
            y:300
        },
        id: 'startButton'
    })
    startButton = document.getElementById('startButton')
    startButton.onclick = function(){
        startButton.remove()
        equipmentButton.remove()
        infoButton.remove()
        standbyUsername = usernameInput.value;
        createAccountButton.remove()
        loginButton.remove()
        logOutButton.remove()
        gameStart(usernameInput.value)
        usernameInput.remove()
    }
    startButton.innerHTML = 'Start'
    startButton.style.textAlign = 'center'

    let equipmentButton = new Divobject({
        color: 'yellow',
        dimensions:{
            width: 200,
            height:100
        },
        position:{
            x:640,
            y:450
        },
        id: 'equipmentButton'
    })
    equipmentButton = document.getElementById('equipmentButton')
    equipmentButton.innerHTML = 'Equipment'
    equipmentButton.style.textAlign = 'center'
    equipmentButton.onclick = function(){
        startButton.remove()
        equipmentButton.remove()
        usernameInput.remove()
        infoButton.remove()
        createAccountButton.remove()
        loginButton.remove()
        logOutButton.remove()
        standbyUsername = usernameInput.value;
        editEquipment()
    }
    let infoButton = new Divobject({
        color: 'yellow',
        dimensions:{
            width: 200,
            height:100
        },
        position:{
            x:640,
            y:600
        },
        id: 'infoButton'
    })
    infoButton = document.getElementById('infoButton')
    infoButton.innerHTML = 'info'
    infoButton.style.textAlign = 'center'
    let createAccountButton = new Divobject({
        color: 'yellow',
        dimensions:{
            width: 200,
            height:100
        },
        position:{
            x:1230,
            y:0
        },
        id: 'createAccountButton'
    })
    createAccountButton = document.getElementById("createAccountButton");
    createAccountButton.innerHTML = "Create Account"
    createAccountButton.style.textAlign = 'center'
    createAccountButton.style.border = "5px Solid Black"
    createAccountButton.onclick = function(){
        startButton.remove()
        equipmentButton.remove()
        usernameInput.remove()
        infoButton.remove()
        createAccountButton.remove()
        loginButton.remove()
        logOutButton.remove()
        createAccount();
    }

    let loginButton = new Divobject({
        color: 'yellow',
        dimensions:{
            width: 200,
            height:100
        },
        position:{
            x:1230,
            y:150
        },
        id: 'loginButton'
    })
    loginButton = document.getElementById("loginButton");
    loginButton.innerHTML = "Log in"
    loginButton.style.textAlign = 'center'
    loginButton.style.border = "5px Solid Black"
    loginButton.onclick = function(){
        startButton.remove()
        equipmentButton.remove()
        usernameInput.remove()
        infoButton.remove()
        loginButton.remove()
        logOutButton.remove()
        createAccountButton.remove()
        login();
    }
    let logOutButton = new Divobject({
        color: 'red',
        dimensions:{
            width: 200,
            height:100
        },
        position:{
            x:1230,
            y:300
        },
        id: 'logOutButton'
    })
    logOutButton = document.getElementById("logOutButton");
    logOutButton.innerHTML = "Log out"
    logOutButton.style.textAlign = 'center'
    logOutButton.style.border = "5px Solid Black"
    logOutButton.onclick = function(){
        startButton.remove()
        equipmentButton.remove()
        usernameInput.remove()
        infoButton.remove()
        loginButton.remove()
        logOutButton.remove()
        createAccountButton.remove()
        currentUsername = "guest"
        playerClass = "shooter"
        playerTriggers = ['shoot','scorpion','hound','sniper','jumper','shield','camo','radar']
        localStorage.removeItem('username');
        localStorage.removeItem('password');
        c.fillStyle = 'lime'
        c.fillRect(0,0,1440,900)
        startMenu()
    }




    let usernameInput = document.createElement("textarea");
    usernameInput.maxLength = 30;
    usernameInput.style.width = 100;
    usernameInput.style.height = 50;
    usernameInput.style.background = "red";
    document.body.append(usernameInput);
    usernameInput.style.position = "absolute";
    usernameInput.style.left = 0;
    usernameInput.style.top = 0;
    usernameInput.style.resize = 'none';
    usernameInput.value = currentUsername;
    infoButton.onclick = function(){
        startButton.remove()
        equipmentButton.remove()
        infoButton.remove()
        loginButton.remove()
        logOutButton.remove()
        usernameInput.remove()
        createAccountButton.remove()
        infoMenu()
    }


}
function editEquipment(){
    c.fillStyle = 'orange'
    c.fillRect(0,0,1440,900)
    xButton = new Divobject({
        dimensions:{
            width:50,
            height:50
        },
        color:'red',
        position:{
            x:0,
            y:0
        },
        id:'xButton'
    })
    xButton = document.getElementById('xButton')
    let standbyTrigger = ''
    for (let i = 0; i < triggerList.length; i++){
        let slotY = 20;
        let slotX = 0;
        if (i > 11){
            slotY = 80;
            slotX = 1320
        } else {
            slotY = 20
        }
        equipSlot = new Divobject({
            dimensions:{
                width: 100,
                height: 50
            },
            color: 'cyan',
            position:{
                x: 110 * (i +1) - slotX,
                y: slotY
            },
            id: 'equipSlot' + i
        })
        document.getElementById('equipSlot' + i).innerHTML = String(triggerList[i])
        document.getElementById('equipSlot' + i).style.textAlign = 'center'
        document.getElementById('equipSlot' + i).onclick = function(){
            standbyTrigger = String(triggerList[i])
        }
    }
    c.fillStyle = 'black'
    c.fillRect(670,200,100,500)
    for(let i = 0; i < 8; i ++){
        let xPosition
        if (i < 4){
            xPosition = 550 
            yPosition = 0
            xXoff = -75
        } else {
            yPosition = 560
            xPosition = 790
            xXoff = 125
        }
        xTriggerSlot = new Divobject({
            dimensions:{
                width:50,
                height:50
            },
            position:{
                y: 140*i + 210 - yPosition,
                x:xPosition + xXoff
            },
            color:'red',
            id: String('xTriggerSlot' + i)

        })

        
        emptyTriggerSlot = new Divobject({
            dimensions:{
                width:100,
                height:50
            },
            position:{
                y: 140*i + 210 - yPosition,
                x:xPosition
            },
            color:'lime',
            id: String('emptyTriggerSlot' + i)

        })
        if (i > playerTriggers.length - 1){
            document.getElementById('emptyTriggerSlot' + i).innerHTML = ''


        } else {
            document.getElementById('emptyTriggerSlot' + i).innerHTML = String(playerTriggers[i])
            document.getElementById('emptyTriggerSlot' + i).style.textAlign = 'center'

        }
        document.getElementById('emptyTriggerSlot' + i).onclick = function(){
            if (!(playerTriggers.includes(standbyTrigger)) && (!(standbyTrigger == ''))){
                playerTriggers[i] = standbyTrigger
                document.getElementById('emptyTriggerSlot' + i).innerHTML = String(standbyTrigger)
            }
        }
        document.getElementById('xTriggerSlot' + i).onclick = function(){
            playerTriggers[i] = ''
            document.getElementById('emptyTriggerSlot' + i).innerHTML = playerTriggers[i]
        }
        
    }
    for (let i = 0; i < classes.length; i++){
        classChoice = new Divobject({
            dimensions:{
                width:75,
                height:75
            },
            position:{
                x: 100,
                y: 40 + 100 * (i+1)
            },
            color: clasColor(classes[i]),
            id:classes[i]
        })
        classChoice = document.getElementById(classes[i])
        if (classes[i] == playerClass){
            classChoice.style.border = "10px solid green"
        } else {
            classChoice.style.border = "10px solid black"
        }
        classChoice.onclick = function(){
            for (let j = 0; j < classes.length; j++){
                document.getElementById(classes[j]).style.border = "10px solid black"

            }
            document.getElementById(classes[i]).style.border = "10px solid green"
            playerClass = classes[i];
        }
    }
    xButton.onclick = function(){
        for (let i = 0; i < triggerList.length; i++){
            document.getElementById('equipSlot' + i).remove()
        }
        for(let i = 0; i < 8; i ++){
            document.getElementById('emptyTriggerSlot' + i).remove()
            document.getElementById('xTriggerSlot' + i).remove()
        }
        for (let i = 0; i < classes.length; i++){
            document.getElementById(classes[i]).remove()
        }
        xButton.remove()
        c.fillStyle = 'lime'
        c.fillRect(0,0,1440,900)
        if (!(currentUsername == 'guest')){
            socket.emit('updateEquipment',currentUsername,playerTriggers,playerClass)
        }
        startMenu()
    }
}
function createAccount(){
    c.fillStyle = "gray";
    c.fillRect(0,0,1440,900);

    xButtonAccount = new Divobject({
        dimensions:{
            width:50,
            height:50
        },
        color:"red",
        position:{
            x:0,
            y:0
        },
        id:"xButtonAccount"
    })
    xButtonAccount = document.getElementById("xButtonAccount");
    xButtonAccount.onclick = function(){
        xButtonAccount.remove()
        usernameArea.remove()
        passwordArea.remove()
        newUserButton.remove()
        c.fillStyle = "lime"
        c.fillRect(0,0,1440,900);
        startMenu();
    }
    c.fillStyle = "black"
    c.font = "50px Arial"
    c.fillText("Username:", 620, 250)
    usernameArea = document.createElement("textarea")
    usernameArea.style.width = 200
    usernameArea.maxLength = 30;

    usernameArea.style.height = 40
    usernameArea.style.position = "absolute"
    usernameArea.style.left = 620
    usernameArea.style.top = 270
    usernameArea.style.border = "5px solid black"
    usernameArea.style.background = "cyan"
    usernameArea.style.resize = 'none';
    document.body.append(usernameArea)

    c.fillText("Password:", 620, 430)
    passwordArea = document.createElement("textarea")
    passwordArea.style.width = 200
    passwordArea.style.height = 40
    passwordArea.style.position = "absolute"
    passwordArea.style.left = 620
    passwordArea.style.top = 450
    passwordArea.maxLength = 30;
    passwordArea.style.border = "5px solid black"
    passwordArea.style.background = "cyan"
    passwordArea.style.resize = 'none';
    document.body.append(passwordArea)

    newUserButton = new Divobject({
        dimensions:{
            width:200,
            height:100
        },
        color:"yellow",
        position:{
            x:620,
            y:550
        },
        id:"newUserButton"
    })
    newUserButton = document.getElementById("newUserButton")
    newUserButton.innerHTML = "Create Account";
    newUserButton.style.textAlign = "center"
    newUserButton.onclick = function(){
        socket.emit('newUser',usernameArea.value,passwordArea.value)
    }


}
function login(){
    inLoggin = true
    c.fillStyle = "gray";
    c.fillRect(0,0,1440,900);

    xButtonAccount = new Divobject({
        dimensions:{
            width:50,
            height:50
        },
        color:"red",
        position:{
            x:0,
            y:0
        },
        id:"xButtonAccount"
    })
    xButtonAccount = document.getElementById("xButtonAccount");
    xButtonAccount.onclick = function(){
        xButtonAccount.remove()
        usernameArea.remove()
        passwordArea.remove()
        newUserButton.remove()
        c.fillStyle = "lime"
        c.fillRect(0,0,1440,900);
        startMenu();
    }
    c.fillStyle = "black"
    c.font = "50px Arial"
    c.fillText("Username:", 620, 250)
    usernameArea = document.createElement("textarea")
    usernameArea.style.width = 200
    usernameArea.style.height = 40
    usernameArea.style.position = "absolute"
    usernameArea.style.left = 620
    usernameArea.style.top = 270
    usernameArea.style.border = "5px solid black"
    usernameArea.style.background = "cyan"
    usernameArea.style.resize = 'none';
    document.body.append(usernameArea)

    c.fillText("Password:", 620, 430)
    passwordArea = document.createElement("textarea")
    passwordArea.style.width = 200
    passwordArea.style.height = 40
    passwordArea.style.position = "absolute"
    passwordArea.style.left = 620
    passwordArea.style.top = 450
    passwordArea.style.border = "5px solid black"
    passwordArea.style.background = "cyan"
    passwordArea.style.resize = 'none';
    document.body.append(passwordArea)

    newUserButton = new Divobject({
        dimensions:{
            width:200,
            height:100
        },
        color:"yellow",
        position:{
            x:620,
            y:550
        },
        id:"newUserButton"
    })
    newUserButton = document.getElementById("newUserButton")
    newUserButton.innerHTML = "Log in";
    newUserButton.style.textAlign = "center"
    newUserButton.onclick = function(){
        socket.emit('login',usernameArea.value,passwordArea.value)
    }


}
function infoMenu(){
    c.fillStyle = 'cyan'
    c.fillRect(0,0,1440,900)
    c.font = '20px Arial'
    c.fillStyle = 'black'
    c.fillText(info,0,100)
    c.fillText(infoTrigger,0,160)

}
function gameStart(startUsername){

    playerHp = 100
    playerEnergy = 100
    currentTriggerSlot = 0
    subTriggerSlot = 4
    onCooldown = false
    inGame = true
    count = 0
    function gameSetup(){
        canvas.style.backgroundColor = 'grey'
        c.fillStyle = 'grey';
        c.fillRect(0,0,canvas.width,canvas.height);
        socket.emit('newPlayer')
        socket.emit("updateUsername",(startUsername));



        map = new Drawing({
            color: 'grey',
            dimensions:{
                width: 2300,
                height:2300
            },
            position:{
                x:0,
                y:0
                },
            id: 'map'
        })
        myPlayer = new Divobject({
            color: clasColor(playerClass),
            dimensions:{
                width: 50,
                height:50
            },
            position:{
                x:700,
                y:400
            },
            id: 'player'
        })
        myPlayer = document.getElementById('player')
    }
    function addTriggerIndicators(){
        for (let i = 0; i < 8; i++){
            if (i < 4){
            triggerSlot = new Divobject({
                dimensions:{
                    width: 50,
                    height: 50
                },
                color: "lime",
                position: {
                    x: 0,
                    y: 500 + i * 65
                },
                id: String('triggerSlot' + i)
            })
            } else {
                triggerSlot = new Divobject({
                    dimensions:{
                        width: 50,
                        height: 50
                    },
                    color: "lime",
                    position: {
                        x: 65,
                        y: 500 + (i-4) * 65
                    },
                    id: String('triggerSlot' + i)
                })
            }
            triggerSlot = document.getElementById('triggerSlot' + i)
            triggerSlot.style.border = '5px solid blue'
            triggerSlot.innerHTML = playerTriggers[i]
        }
        document.getElementById('triggerSlot' + 0).style.border = '5px solid red'
        document.getElementById('triggerSlot' + 4).style.border = '5px solid red'

    }
    function addChat(){
        let chat = document.createElement("textarea")
        chat.style.position = 'absolute';
        chat.style.background = "yellow"
        chat.style.border = "5px solid black"
        chat.maxLength = 20;

        chat.style.width = 150;
        chat.style.height = 40;
        chat.style.left = 1440-150
        chat.style.top = 860
        chat.id = 'chat'
        chat.style.resize = 'none';
        document.body.append(chat);
    }

    gameSetup()
    editControls(true)
    addTriggerIndicators()
    addChat()
    socket.emit('updateClass',playerClass);

}
function isColide(a,b){
    if ((a.position.x < b.position.x + b.dimensions.width) &&
        (a.position.x + a.dimensions.width > b.position.x) && 
        (a.position.y < b.position.y + b.dimensions.height) &&
        (a.position.y + a.dimensions.height > b.position.y))
    {
        return(true)
    } else {
        return false
    }
}
function clasColor(clas){
    if (clas == "shooter"){
        return("red")
    } else if (clas == "magenta"){
        return("magenta")
    } else if (clas == "lime"){
        return("lime")
    } else if (clas == "yellow"){
        return('yellow')
    } else if (clas == "orange"){
        return('orange')
    } else if (clas == "pink"){
        return('pink')
    } else if (clas == "blue"){
        return("blue")
    }
}
function attackCooldown(number){
    onCooldown = true
    setTimeout(function(){
        onCooldown = false
    },number)
}
function attack(){
    if (onCooldown == false){
        trig = playerTriggers[currentTriggerSlot]
        if (trig == 'jumper'){
            if (playerEnergy > 20){
                playerEnergy -= 20
                attackCooldown(200);
                socket.emit('triggerUse',trig, lastKey,playerEnergy)
            }
        } else if (trig == 'wall'){
            if (playerEnergy > 30){
                playerEnergy -= 30
                socket.emit('triggerUse',trig, lastKey,playerEnergy)
            }
        }else if (trig == 'teleport'){
            if ((playerEnergy > 20)&& (!(moveLock))){
                attackCooldown(500);
                playerEnergy -= 20
                socket.emit('triggerUse',trig, lastKey,playerEnergy)
            }
        }  else {
        socket.emit('triggerUse',trig, lastKey,playerEnergy)
        }
    }
}
function subAttack(){
    if (onCooldown == false){
        trig = playerTriggers[subTriggerSlot]
        if (trig == 'jumper'){
            if (playerEnergy > 20){
                playerEnergy -= 20
                attackCooldown(200);

                socket.emit('triggerUse',trig, lastKey,playerEnergy)
            }
        } else if (trig == 'wall'){
            if (playerEnergy > 30){
                playerEnergy -= 30
                socket.emit('triggerUse',trig, lastKey,playerEnergy)
            }
        } else if ((trig == 'teleport')&&(!(moveLock))){
            if (playerEnergy > 20){
                attackCooldown(500);
                playerEnergy -= 20
                socket.emit('triggerUse',trig, lastKey,playerEnergy)
            }
        }else {
        socket.emit('triggerUse',trig, lastKey,playerEnergy)
        }
    }
}
function editControls(isAdd){
 
    function downKeys(e){
        if (inGame == false){
            window.removeEventListener('keydown',downKeys)
            window.removeEventListener('keyup',upKeys)
        }
        switch (e.key){
            case 'w':
                keys.w.pressed = true
                lastKey = "w"
                break
            case 's':
                keys.s.pressed = true
                lastKey = "s"
                break
            case 'a':
                keys.a.pressed = true
                lastKey = "a"
                break
            case 'd':
                keys.d.pressed = true
                lastKey = "d"
                break
            case 'o':
                attack()
                break
            case 'p':
                subAttack()
                break
            case '1':
                socket.emit('updateTriggerKey',playerTriggers[0])
                for (let i = 0; i < 4; i ++){
                    document.getElementById('triggerSlot' + i).style.border = '5px solid blue'
                }
                document.getElementById('triggerSlot' + 0).style.border = '5px solid red'
                currentTriggerSlot = 0
                break
            case '2':
                socket.emit('updateTriggerKey',playerTriggers[1])
                for (let i = 0; i < 4; i ++){
                    document.getElementById('triggerSlot' + i).style.border = '5px solid blue'
                }
                document.getElementById('triggerSlot' + 1).style.border = '5px solid red'
                currentTriggerSlot = 1
                break
            case '3':
                socket.emit('updateTriggerKey',playerTriggers[2])
                for (let i = 0; i < 4; i ++){
                    document.getElementById('triggerSlot' + i).style.border = '5px solid blue'
                }
                document.getElementById('triggerSlot' + 2).style.border = '5px solid red'
                currentTriggerSlot = 2
                break
            case '4':
                socket.emit('updateTriggerKey',playerTriggers[3])
                for (let i = 0; i < 4; i ++){
                    document.getElementById('triggerSlot' + i).style.border = '5px solid blue'
                }
                document.getElementById('triggerSlot' + 3).style.border = '5px solid red'
                currentTriggerSlot = 3
                break
            case '5':
                socket.emit('updateSubTrigger',playerTriggers[4])
                for (let i = 4; i < 8; i ++){
                    document.getElementById('triggerSlot' + i).style.border = '5px solid blue'
                }
                document.getElementById('triggerSlot' + 4).style.border = '5px solid red'
                subTriggerSlot = 4
                break
            case '6':
                socket.emit('updateSubTrigger',playerTriggers[5])
                for (let i = 4; i < 8; i ++){
                    document.getElementById('triggerSlot' + i).style.border = '5px solid blue'
                }
                document.getElementById('triggerSlot' + 5).style.border = '5px solid red'
                subTriggerSlot = 5
                break
            case '7':
                socket.emit('updateSubTrigger',playerTriggers[6])
                for (let i = 4; i < 8; i ++){
                    document.getElementById('triggerSlot' + i).style.border = '5px solid blue'
                }
                document.getElementById('triggerSlot' + 6).style.border = '5px solid red'
                subTriggerSlot = 6
                break
            case '8':
                socket.emit('updateSubTrigger',playerTriggers[7])
                for (let i = 4; i < 8; i ++){
                    document.getElementById('triggerSlot' + i).style.border = '5px solid blue'
                }
                document.getElementById('triggerSlot' + 7).style.border = '5px solid red'
                subTriggerSlot = 7
                break
        
    }
    }
    function upKeys(e){
        switch (e.key){
            case 'w':
                keys.w.pressed = false
                break
            case 's':
                keys.s.pressed = false
                break
            case 'a':
                keys.a.pressed = false
                break
            case 'd':
                keys.d.pressed = false
                break
        }
    }

    if (isAdd == true){
        window.addEventListener('keydown',downKeys)
        window.addEventListener('keyup',upKeys)

    } 
}
socket.on('updatePlayers',(backendPlayers,objectMap) => {
    if (inGame == true){
    myPlayer.innerHTML = backendPlayers[socket.id].username
    xOffset = backendPlayers[socket.id].x
    yOffset = backendPlayers[socket.id].y
    let player = backendPlayers[socket.id]
    direction = ''

    if (moveLock == false){
        if (keys.w.pressed && (lastKey == 'w')){
            direction = 'up'
            socket.emit('movePlayer',direction,player)

        } else if (keys.s.pressed && (lastKey == 's')){
            direction = 'down'
            socket.emit('movePlayer',direction,player)


        } else if (keys.a.pressed && (lastKey == 'a')){
            direction = 'left'
            socket.emit('movePlayer',direction,player)


        } else if (keys.d.pressed && (lastKey == 'd')){
            direction = 'right'
            socket.emit('movePlayer',direction,player)

        } 
    }
    map.position.x = xOffset
    map.position.y = yOffset
    c.fillStyle = 'grey'
    c.fillRect(0,0,1440,900)
    map.draw()
    socket.emit('updateChat',(document.getElementById('chat').value),playerHp);
    let opponents = []
    for (id in backendPlayers){
        color = clasColor(backendPlayers[id].clas);
        if (!(id == socket.id)){if (!(backendPlayers[id].status == 'invisible')){
            c.font = "15px arial";
            c.fillStyle = 'black';
            c.fillText(backendPlayers[id].username,700 + xOffset -backendPlayers[id].x,415 +yOffset - backendPlayers[id].y,50)
            c.font = "20px arial";
            c.fillText(backendPlayers[id].chat,725 - (backendPlayers[id].chat.length * 5) + xOffset -backendPlayers[id].x,395 +yOffset - backendPlayers[id].y,200)
            c.fillStyle = "red";
            c.fillRect(680 + xOffset - backendPlayers[id].x,400 + yOffset - backendPlayers[id].y,10,backendPlayers[id].hp/2)
            color = clasColor(backendPlayers[id].clas);

        } if (backendPlayers[id].status == 'invisible'){
            color = 'none'
        } 
            
            opponent = new Drawing({
                dimensions:{
                    width:50,
                    height:50
                },
                color: color,
                position:{
                    x:700 + xOffset -backendPlayers[id].x,
                    y:400 + yOffset - backendPlayers[id].y
                },
                id:id
            })
          
            opponent.draw()
            opponents.push(opponent)
            
            
        } else {
            if(backendPlayers[id].status == 'slow'){
                myPlayer.style.border = '5px solid black'
                myPlayer.style.width = 40
                myPlayer.style.height = 40
            } else if(backendPlayers[id].status == 'invisible'){
                myPlayer.style.border = '5px solid cyan'
                myPlayer.style.width = 40
                myPlayer.style.height = 40
            } else if(backendPlayers[id].status == 'cloaked'){
                myPlayer.style.border = '5px solid purple'
                myPlayer.style.width = 40
                myPlayer.style.height = 40
            }else {
                myPlayer.style.border = 'none'
                myPlayer.style.width = 50
                myPlayer.style.height = 50 
            }
            c.font = "20px arial";
            c.fillStyle = 'black';
            c.fillText(document.getElementById('chat').value,725 - document.getElementById('chat').value.length * 5,395,200)

        }
    }
  
    let obstacles = []

    shields.forEach(shield =>{
        c.fillStyle = shield.color
        let shieldPlayer = player
        opponents.forEach(enemy =>{
            if (enemy.id == shield.id){
                shieldPlayer = enemy
            }
        })
        let hitbox
        if (shieldPlayer == player){
            c.fillRect(700+ shield.position.x, 400 + shield.position.y,shield.dimensions.width,shield.dimensions.height)
            hitbox = new Hitbox({
                position:{
                    x:700+ shield.position.x,
                    y:400 + shield.position.y
                }, 
                dimensions:{
                    width: shield.dimensions.width,
                    height:shield.dimensions.height
                },
                player: socket.id
            })
        } else {
            hitbox = new Hitbox({
                position:{
                    x:shield.position.x + shieldPlayer.position.x,
                    y:shield.position.y + shieldPlayer.position.y
                }, 
                dimensions:{
                    width: shield.dimensions.width,
                    height:shield.dimensions.height
                },
                player: shield.id
            })
            c.fillRect(shield.position.x + shieldPlayer.position.x,  shield.position.y+ shieldPlayer.position.y,shield.dimensions.width,shield.dimensions.height)

        }
        obstacles.push(hitbox)

    })
    for (let row = 0; row < objectMap.length; row++){
            for (let element = 0; element < objectMap[row].length; element++){
            if (objectMap[row][element] == 1){
                obstacle = new Drawing({
                    dimensions:{
                        width:50,
                        height:50
                    },
                    color: 'black',
                    position:{
                        y:row * 50 + yOffset,
                        x:element * 50 + xOffset
                    }
                })
                obstacles.push(obstacle)
                obstacle.draw()
            } else if (objectMap[row][element] == 2){
                jumper = new Drawing({
                    dimensions:{
                        width:50,
                        height:50
                    },
                    color: 'lime',
                    position:{
                        y:row * 50 + yOffset,
                        x:element * 50 + xOffset
                    }
                })
                jumper.draw()
            } else if (objectMap[row][element] == 3){
                obstacle = new Drawing({
                    dimensions:{
                        width:50,
                        height:50
                    },
                    color: 'cyan',
                    position:{
                        y:row * 50 + yOffset,
                        x:element * 50 + xOffset
                    }
                })
                obstacles.push(obstacle)
                obstacle.draw()
            }
        }
        
    };


    projectiles.forEach(element => {
        let projectileDamage
        if (element.attackType == 'bullet'){
            projectileDamage = 2
        c.fillStyle = element.color
        element.move()
        c.fillRect(-element.position.x + 742 + xOffset, -element.position.y + 442 + yOffset,element.dimensions.width, element.dimensions.height)
        } else if (element.attackType == 'snipe'){
            projectileDamage = 75

            c.fillStyle = element.color
            c.fillRect(-element.position.x + 742 + xOffset, -element.position.y + 442 + yOffset,element.dimensions.width, element.dimensions.height)
            element.move()
        } else if (element.attackType == 'lightning'){
            projectileDamage = 25

            c.fillStyle = element.color
            c.fillRect(-element.position.x + 742 + xOffset, -element.position.y + 442 + yOffset,element.dimensions.width, element.dimensions.height)
            element.move()
        }else if (element.attackType == 'shoot-lead'){
            projectileDamage = 0
        c.fillStyle = element.color
        element.move()
        c.fillRect(-element.position.x + 742 + xOffset, -element.position.y + 442 + yOffset,element.dimensions.width, element.dimensions.height)
        }else if (element.attackType == 'asteroid'){
            projectileDamage = 2
        c.fillStyle = element.color
        element.move()
        c.fillRect(-element.position.x + 742 + xOffset, -element.position.y + 442 + yOffset,element.dimensions.width, element.dimensions.height)
        }if (element.attackType == 'hound'){
            projectileDamage = 1
        c.fillStyle = element.color

        let trackX = 1000;
        let trackY = 1000;
        for (id in backendPlayers){
            if ((Math.abs(element.position.x - backendPlayers[id].x) < (Math.abs(element.position.x - trackX)))   &&(!(id == element.id))){
                trackX = backendPlayers[id].x
            }
            if ((Math.abs(element.position.y - backendPlayers[id].y) < (Math.abs(element.position.y - trackY)))   &&(!(id == element.id))){
                trackY = backendPlayers[id].y
            }
        }
        bulletSpeed = 4
        if (element.position.x > trackX){
            element.position.x -= bulletSpeed
        } else if (element.position.x < trackX) {
            element.position.x += bulletSpeed
        } else {
            element.position.x += bulletSpeed
        }
        if (element.position.y > trackY){
            element.position.y -= bulletSpeed
        } else if (element.position.x < trackY) {
            element.position.y += bulletSpeed
        } else {
            element.position.y += bulletSpeed
        }
        if (trackX == 1000){
            for (let ii = 0; ii < projectiles.length;ii++){
                if (projectiles[ii] == element){
                    projectiles.splice(ii,1)
                }
            }
        }
        

        c.fillRect(-element.position.x + 742 + xOffset, -element.position.y + 442 + yOffset,element.dimensions.width, element.dimensions.height)
        } 
        hitbox = new Hitbox({
            dimensions:element.dimensions,
            position:{
                x:-element.position.x + 742 + xOffset,
                y: -element.position.y + 442 + yOffset
            },
            player: element.id
        })
        for (let i = 0; i < opponents.length; i++){
            if ((isColide(hitbox,opponents[i])) &&( !(opponents[i].id == hitbox.player))){
               for (let ii = 0; ii < projectiles.length;ii++){
                if (projectiles[ii] == element){
                    if (element.attackType == 'asteroid'){
                        c.fillRect(-element.position.x + 742 + xOffset - element.dimensions.width * 20/2, -element.position.y + 442 + yOffset-element.dimensions.width * 20/2,element.dimensions.width * 20, element.dimensions.height * 20)
                        hitbox.position.x = -element.position.x + 742 + xOffset - element.dimensions.width * 20/2
                        hitbox.position.y =  -element.position.y + 442 + yOffset-element.dimensions.width * 20/2
                        hitbox.dimensions.width = element.dimensions.width * 20
                        hitbox.dimensions.height = element.dimensions.height * 20
                        }
                        projectiles.splice(ii,1)
                }
           }
            }
        }
        for (let i = 0; i < obstacles.length; i++){
            if ((isColide(hitbox,obstacles[i])) && (!(element.id == obstacles[i].player))){
                for (let ii = 0; ii < projectiles.length;ii++){
                    if (projectiles[ii] == element){
                        if (element.attackType == 'asteroid'){
                        c.fillRect(-element.position.x + 742 + xOffset - element.dimensions.width * 20/2, -element.position.y + 442 + yOffset-element.dimensions.width * 20/2,element.dimensions.width * 20, element.dimensions.height * 20)
                        hitbox.position.x = -element.position.x + 742 + xOffset - element.dimensions.width * 20/2
                        hitbox.position.y =  -element.position.y + 442 + yOffset-element.dimensions.width * 20/2
                        hitbox.dimensions.width = element.dimensions.width * 20
                        hitbox.dimensions.height = element.dimensions.height * 20
                        }
                        projectiles.splice(ii,1)
                    }
                }
            }
        }
        playerHitbox = new Hitbox({
            dimensions:{
                width: 50,
                height:50
            },
            position:{
                x:700,
                y:400
            }
        })
        if ((isColide(hitbox,playerHitbox)) && (!(hitbox.player == socket.id))){
            playerHp -= projectileDamage
            if (element.attackType == 'shoot-lead'){
                socket.emit('playerStatus','slow',5000)
                if (playerEnergy > 0){
                    playerEnergy -= 3
                }
            }
            for (let ii = 0; ii < projectiles.length;ii++){
                if (projectiles[ii] == element){
                    projectiles.splice(ii,1)
                }
            }
        }
    });

    melee.forEach(weapon =>{
        c.fillStyle = weapon.color
        let meleePlayer = player
        opponents.forEach(enemy =>{
            if (enemy.id == weapon.id){
                meleePlayer = enemy
            }
        })
        let hitbox
        if (meleePlayer == player){
            c.fillRect(700+ weapon.position.x, 400 + weapon.position.y,weapon.dimensions.width,weapon.dimensions.height)
            hitbox = new Hitbox({
                position:{
                    x:700+ weapon.position.x,
                    y:400 + weapon.position.y
                }, 
                dimensions:{
                    width: weapon.dimensions.width,
                    height:weapon.dimensions.height
                },
                player: socket.id
            })
        } else {
            hitbox = new Hitbox({
                position:{
                    x:weapon.position.x + meleePlayer.position.x,
                    y:weapon.position.y + meleePlayer.position.y
                }, 
                dimensions:{
                    width: weapon.dimensions.width,
                    height:weapon.dimensions.height
                },
                player: weapon.id
            })
            c.fillRect(weapon.position.x + meleePlayer.position.x,  weapon.position.y+ meleePlayer.position.y,weapon.dimensions.width,weapon.dimensions.height)

        }
        weapon.lifespan -= 1;
        if (weapon.direction == 'd'){
            weapon.position.y += 5
        } else if (weapon.direction == 'a'){
            weapon.position.y -= 5
        } else if (weapon.direction == 'w'){
            weapon.position.x += 5
        } else if (weapon.direction == 's'){
            weapon.position.x -= 5
        }

        if (weapon.lifespan == 0){
            for (let ii = 0; ii < melee.length;ii++){
                if (melee[ii] == weapon){
                    melee.splice(ii,1)
                }
           }
        }

        playerHitbox = new Hitbox({
            dimensions:{
                width: 50,
                height:50
            },
            position:{
                x:700,
                y:400
            }
        })
        
            if ((isColide(playerHitbox, hitbox)) && (!(hitbox.player == socket.id))){
                if (weapon.attackType == 'sword'){
                playerHp -= 6
                } else if (weapon.attackType == 'scorpion'){
                    playerHp -= 5
                }
            }
                
    
    })    
    if ((playerTriggers[currentTriggerSlot] == 'shield')){
        trig = playerTriggers[currentTriggerSlot]
        socket.emit('triggerUse',trig, lastKey,playerEnergy)
    } else if (playerTriggers[subTriggerSlot] == 'shield'){
        trig = playerTriggers[subTriggerSlot]
        socket.emit('triggerUse',trig, lastKey,playerEnergy)
    }
    moveLock = false
    if ((playerTriggers[currentTriggerSlot] == 'sniper') || (playerTriggers[subTriggerSlot] == 'sniper')){
        moveLock = true
        c.fillStyle = 'green'
        if (lastKey == 'a'){
            c.fillRect(500,450 - 25,10,10)
        } else  if (lastKey == 'd'){
            c.fillRect(940,450 - 25,10,10)
        } else if (lastKey == 'w'){
            c.fillRect(720 + 8,230,10,10)
        } else if (lastKey == 's'){
            c.fillRect(720 + 8,620,10,10)
        }
    }
    if ((playerTriggers[currentTriggerSlot] == 'lightning') || (playerTriggers[subTriggerSlot] == 'lightning')){
        moveLock = true
        c.fillStyle = 'green'
        if (lastKey == 'a'){
            c.fillRect(500,450 - 25,10,10)
        } else  if (lastKey == 'd'){
            c.fillRect(940,450 - 25,10,10)
        } else if (lastKey == 'w'){
            c.fillRect(720 + 8,230,10,10)
        } else if (lastKey == 's'){
            c.fillRect(720 + 8,620,10,10)
        }
    }
    if ((playerTriggers[currentTriggerSlot] == 'camo')){
        if (playerEnergy > 1){
        playerEnergy -= 0.3
        trig = playerTriggers[currentTriggerSlot]
        socket.emit('triggerUse',trig, lastKey,playerEnergy)
        }
    } else if (playerTriggers[subTriggerSlot] == 'camo'){
        if (playerEnergy > 1){
            playerEnergy -= 0.3
            trig = playerTriggers[subTriggerSlot]
            socket.emit('triggerUse',trig, lastKey,playerEnergy)
            }
    }
    if ((playerTriggers[currentTriggerSlot] == 'cloak')){
        if (playerEnergy > 1){
        playerEnergy -= 0.05
        trig = playerTriggers[currentTriggerSlot]
        socket.emit('triggerUse',trig, lastKey,playerEnergy)
        }
    } else if (playerTriggers[subTriggerSlot] == 'cloak'){
        if (playerEnergy > 1){
            playerEnergy -= 0.05
            trig = playerTriggers[subTriggerSlot]
            socket.emit('triggerUse',trig, lastKey,playerEnergy)
            }
    }
    if ((playerTriggers[currentTriggerSlot] == 'radar') || (playerTriggers[subTriggerSlot] == 'radar')){
        playerEnergy -= 0.05
        c.fillStyle = 'cyan'
        c.fillRect(1400 - objectMap.length * 8,20, objectMap.length * 8, objectMap[0].length * 8)
        c.fillStyle = clasColor(playerClass)
        c.fillRect(1500 - objectMap.length * 8 - backendPlayers[socket.id].x / 50 * 8, 80 - backendPlayers[socket.id].y / 50 * 8,8,8)
        for (id in backendPlayers){
            if ((!(id == socket.id)) && (!(backendPlayers[id].status == "cloaked"))){
                c.fillStyle = clasColor(backendPlayers[id].clas)
                c.fillRect(1500 - objectMap.length * 8 - backendPlayers[id].x / 50 * 8, 80 - backendPlayers[id].y / 50 * 8,8,8)

            }
        }
    }
    c.fillStyle = 'red'
    c.fillRect(0,0,50, 3* playerHp)
    c.fillStyle = 'cyan'
    c.fillRect(50,0,50,playerEnergy * 3)
    if (playerEnergy > 0){
        energyGain = 0 
        playerTriggers.forEach(element =>{
            if (!(element == 0)){
                energyGain += 0.1/8
            }
        })
        playerEnergy -= energyGain
    }
    if (playerEnergy < 100){
        playerEnergy+= .2
    }
    shields = []

    if(playerHp <= 0){
        inGame = false
        editControls(false);
        socket.emit('removePlayer')
        c.fillStyle = "lime";
        c.fillRect(0,0,1440,900)
        for (let i = 0; i < 8; i++){
            document.getElementById('triggerSlot' + i).remove();
        }
        document.getElementById('chat').remove();
        startMenu();
        
        myPlayer.remove();
    }
}
})
socket.on('createAttack',(player, trig, lastKey,id) =>{
    if (trig == 'shoot'){
        if (id == socket.id){
        playerEnergy -= 20
        }
        attackCooldown(500)
        for (let i = 0; i < 16; i ++){
            bullet = new Drawing({
                position:{
                    x:player.x + 15 * Math.floor(i/4) ,
                    y:player.y  + 15 * (i%4)
                },
                color:'cyan',
                dimensions:{
                    width:10,
                    height:10
                },
                id: id,
                attackType: 'bullet'
            })
            projectiles.push(bullet)
                bullet.direction = lastKey
        }
} else if (trig == 'sword'){
            if (id == socket.id){
            playerEnergy -= 10
            }
        attackCooldown(500)
        xMelee = -50
        widthMelee = 10
        heightMelee = 10
        yMelee = 0
        if (lastKey == 'd'){
            xMelee = 0
            widthMelee = 100
        } else if (lastKey == 'a'){
            xMelee = -150
            widthMelee = 100
            yMelee  = 40
        } else if (lastKey == 'w'){
            yMelee = -100
            heightMelee = 100
        } else if (lastKey == 's'){
            yMelee = 50
            xMelee = -10
            heightMelee = 100
        } 
        sword = new Drawing({
            position:{
                x:50 + xMelee,
                y:0 + yMelee
            },
            color:'cyan',
            dimensions:{
                width:widthMelee,
                height:heightMelee
            },
            id: id,
            lifespan: 9,
            direction: lastKey,
            attackType:'sword'

        })
        melee.push(sword)
    
} else if (trig == 'scorpion'){
        if (id == socket.id){
        playerEnergy -= 5
        }
    attackCooldown(50)
    xMelee = -50
    widthMelee = 20
    heightMelee = 20
    yMelee = 0
    if (lastKey == 'd'){
        xMelee = 0
    } else if (lastKey == 'a'){
        xMelee = -70
        yMelee  = 30
    } else if (lastKey == 'w'){
        yMelee = -20
    } else if (lastKey == 's'){
        yMelee = 50
        xMelee = -20
    } 
    sword = new Drawing({
        position:{
            x:50 + xMelee,
            y:0 + yMelee
        },
        color:'cyan',
        dimensions:{
            width:widthMelee,
            height:heightMelee
        },
        id: id,
        lifespan: 4,
        direction: lastKey,
        attackType:'scorpion'

    })
    melee.push(sword)
    
}else if (trig == 'shield'){
            if (id == socket.id){
            playerEnergy -= 0.1
            }
        xMelee = -50
        widthMelee = 10
        heightMelee = 10
        yMelee = 0
        if (lastKey == 'd'){
            yMelee = -25
            xMelee = 10
            heightMelee = 100
        } else if (lastKey == 'a'){
            xMelee = -70
            heightMelee = 100
            yMelee  = -25
        } else if (lastKey == 'w'){
            yMelee = -20
            widthMelee = 100
            xMelee = -75
        } else if (lastKey == 's'){
            yMelee = 60
            xMelee = -75
            widthMelee = 100
        } 
        shield = new Drawing({
            position:{
                x:50 + xMelee,
                y:0 + yMelee
            },
            color:'cyan',
            dimensions:{
                width:widthMelee,
                height:heightMelee
            },
            id: id,
            lifespan: -1,
            direction: lastKey

        })
        shields.push(shield)
} else if(trig == 'sniper'){
            if (id == socket.id){
            playerEnergy -= 70
            }
        attackCooldown(1500)
            snipe = new Drawing({
                position:{
                    x:player.x + 15,
                    y:player.y  + 15
                },
                color:'cyan',
                dimensions:{
                    width:10,
                    height:10
                },
                id: id,
                attackType: 'snipe'

            })
            projectiles.push(snipe)
            snipe.direction = lastKey
                  
        
} else if(trig == 'lightning'){
    if (id == socket.id){
    playerEnergy -= 25
    }
attackCooldown(1500/4)
lightning = new Drawing({
        position:{
            x:player.x + 15,
            y:player.y  + 15
        },
        color:'cyan',
        dimensions:{
            width:10,
            height:10
        },
        id: id,
        attackType: 'lightning'

    })
    projectiles.push(lightning)
    lightning.direction = lastKey
          

}else if (trig == 'shoot-lead'){
        if (id == socket.id){
        playerEnergy -= 15
        }
        attackCooldown(500)
        for (let i = 0; i < 16; i ++){
            bullet = new Drawing({
                position:{
                    x:player.x + 15 * Math.floor(i/4) ,
                    y:player.y  + 15 * (i%4)
                },
                color:'black',
                dimensions:{
                    width:10,
                    height:10
                },
                id: id,
                attackType: 'shoot-lead'


            })
            projectiles.push(bullet)
                bullet.direction = lastKey
        }
    
} else if (trig == 'asteroid'){
    if (id == socket.id){
        playerEnergy -= 30
        }
        attackCooldown(1000)
        for (let i = 0; i < 16; i ++){
            bullet = new Drawing({
                position:{
                    x:player.x + 15 * Math.floor(i/4) ,
                    y:player.y  + 15 * (i%4)
                },
                color:'orange',
                dimensions:{
                    width:10,
                    height:10
                },
                id: id,
                attackType: 'asteroid'
            })
            projectiles.push(bullet)
                bullet.direction = lastKey
        }
} else if (trig == 'hound'){
    if (id == socket.id){
    playerEnergy -= 40
    }
    attackCooldown(1000)
    for (let i = 0; i < 16; i ++){
        bullet = new Drawing({
            position:{
                x:player.x + 15 * Math.floor(i/4) ,
                y:player.y  + 15 * (i%4)
            },
            color:'lime',
            dimensions:{
                width:10,
                height:10
            },
            id: id,
            attackType: 'hound'
        })
        projectiles.push(bullet)
            bullet.direction = lastKey
    }
}

})
socket.on("sendMessage",(message) =>{
    alert(message)
})
socket.on('loggedIn',(dataEquipment,clas) =>{
    if (inLoggin){
    currentUsername  = usernameArea.value
    localStorage.setItem("username",usernameArea.value)
    localStorage.setItem("password",passwordArea.value)
    xButtonAccount.remove()
    usernameArea.remove()
    passwordArea.remove()
    newUserButton.remove()
    c.fillStyle = "lime"
    c.fillRect(0,0,1440,900);
    startMenu();
    inLoggin = false
    }
    playerTriggers = dataEquipment
    playerClass = clas
})
if ((!(localStorage.getItem("username") == null)) && (!(localStorage.getItem("password") == null))){
    socket.emit('login',(localStorage.getItem("username")),(localStorage.getItem("password")))
    currentUsername = localStorage.getItem("username")
}
startMenu()

const path = require('path');
const express = require('express');
const socket = require('socket.io');
const app = express();
const PORT = process.env.PORT || 3000
const server = app.listen(PORT, () => console.log(`Server has started on port ${PORT}`))

// Static files
app.use(express.static(path.join(__dirname, 'public')))

// Socket setup
const io = socket(server);

let rooms = [];
let botName = 'SecuroChat Bot'
let users = new Map();

app.get('/:code', function (req, res) {
    let codeFound = false;

    for (let i = 0; i < rooms.length; i++) {
        if (rooms[i].roomCode === req.params.code) {
            codeFound = true;
        }
    }

    if (codeFound) {
        res.sendFile(path.join(__dirname, 'public', 'chat.html'));
    } else {
        res.redirect('/');
    }
});

io.on('connection', (socket) => {
    console.log('made connection', socket.id)


    // Welcome user
    socket.emit('message', `${botName}: Hello, welcome to SecuroChat!`)

    socket.on('createRoom', (data) => {
        rooms.push(data)
        console.log(rooms);
        socket.join(data.roomCode);
        users.set(data.user, data.roomCode);
        console.log(users);
    })

    socket.on('connectUser', (username) => {
        if (users.has(username)) {
            socket.join(users.get(username))
            socket.to(users.get(username)).emit("message", `${username} has joined the chat.`)
        };
    })

    socket.on('joinRoom', (data) => {
        let codeFound = false;
        for (let i = 0; i < rooms.length; i++) {
            if (rooms[i].roomCode === data.roomCode && data.user !== '') {
                codeFound = true
            }
        }
        if (codeFound) {
            rooms.push(data)
            console.log(rooms)
            socket.join(data.roomCode)
            users.set(data.user, data.roomCode);
        }
        if (!codeFound) {
            console.log('Code does not exist.')
        }
    })

    // socket.on('message', (message) => {
    //     console.log(message)
    //     socket.emit('incomingMessage', (message));
    // })

})
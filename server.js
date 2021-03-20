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


// Botname for sending bot messages
let botName = 'SecuroChat Bot'

// map users to their respective room
let users = new Map();

// Map id to username
let id = new Map();

// map rooms to the users inside
let rooms = new Map();




app.get('/:code', function (req, res) {
    if (rooms.has(req.params.code)) {
        res.sendFile(path.join(__dirname, 'public', 'chat.html'));
    } else {
        res.redirect('/');
    }
});

io.on('connection', (socket) => {
    console.log('made connection', socket.id)


    socket.on('createRoom', (data) => {
        rooms.set(data.roomCode, [data.user])
        users.set(data.user, data.roomCode);
        socket.join(data.roomCode);
    })

    socket.on('connectUser', (username) => {
        if (users.has(username)) {
            socket.join(users.get(username))
            console.log(id.values())
            let userFound = false;
            for (let name of id.values()) {
                if (name === username) {
                    userFound = true;
                }
            }
            id.set(socket.id, username);

            if (userFound) {
                socket.emit('botMessage', `${botName}: You've rejoined.`)
            }
            else {
                // Welcome user
                socket.emit('botMessage', `${botName}: Hello, welcome to SecuroChat!`)
                socket.to(users.get(username)).emit("botMessage", `${username} has joined the chat.`)
            }
        };
    })
    socket.on('joinRoom', (data) => {
        if (rooms.has(data.roomCode)) {
            // Check for the array of users mapped to the room code
            let arrayOfUsers = rooms.get(data.roomCode);

            if (!arrayOfUsers.includes(data.user)) {
                arrayOfUsers.push(data.user);
                rooms.set(data.roomCode, arrayOfUsers);
                console.log(rooms);
            }

            if (!users.has(data.user)) {
                users.set(data.user, data.roomCode);
            }

            socket.join(data.roomCode)
        }
    })

    socket.on('disconnect', (reason) => {
        if (id.has(socket.id)) {
            let username = id.get(socket.id)
            let userCount = 0;
            for (let name of id.values()) {
                if (name === username) {
                    userCount++;
                }
            }

            if (userCount === 1) {
                // Send a message when a user disconnects fully
                socket.to(users.get(username)).emit('botMessage', `${username} has left the chat.`)
                users.delete(username);
            }

            id.delete(socket.id);

        }


    })



})

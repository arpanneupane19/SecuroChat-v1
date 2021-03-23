const path = require('path');
const express = require('express');
const socket = require('socket.io');
const app = express();
const moment = require('moment');
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

let codeExists = false;

app.get('/:code', function (req, res) {
    // If the rooms map has the code passed in the url, do this
    if (rooms.has(req.params.code)) {
        res.sendFile(path.join(__dirname, 'public', 'chat.html'));
    }
    else {
        res.redirect('/');
    }

});


io.on('connection', (socket) => {
    // Create room, takes in data, and then sets the users map and the rooms map with the data given and joins the room.
    socket.on('createRoom', (data) => {
        if (rooms.has(data.roomCode)) {
            console.log('Room code already exists. Cannot create.')
            socket.emit('redirect', 'join.html')
        }

        if (!rooms.has(data.roomCode)) {
            rooms.set(data.roomCode, [data.user])
            users.set(data.user, data.roomCode);
            socket.join(data.roomCode);
            console.log(rooms, users);
            socket.emit('redirect', `${data.roomCode}`)
        }


    })

    socket.on('connectUser', (username) => {
        if (users.has(username)) {
            socket.join(users.get(username))
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

        // Redirects to home page if user does not have a room.
        if (!users.has(username)) {
            socket.emit('redirect', 'index.html')

        }
        if (username === null) {
            socket.emit('redirect', 'join.html')
        }
    })

    // First checks if the rooms map has the room code that was entered in frontend and then does validation to join rooms.
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
            socket.emit('redirect', `${data.roomCode}`)


        }
    })


    // Disconnects and sends a disconnection message to users connected in the room.
    socket.on('disconnect', (reason) => {
        if (id.has(socket.id)) {
            let username = id.get(socket.id)
            let room = users.get(username)
            let userCount = 0;
            let arrayOfUsers = rooms.get(room);
            // If there's multiple id's with the same username then increase the count.
            for (let name of id.values()) {
                if (name === username) {
                    userCount++;
                }
            }

            if (userCount === 1) {
                // Send a message when a user disconnects fully
                socket.emit('redirect', 'index.html')
                socket.leave(users.get(username));
                socket.to(users.get(username)).emit('botMessage', `${username} has left the chat.`)
                users.delete(username);

                if (arrayOfUsers.includes(username)) {
                    let index = arrayOfUsers.indexOf(username)
                    arrayOfUsers.splice(index, 1);
                    console.log("Room once user leaves.", rooms)
                }

                console.log("users map", users);
            }
            if (arrayOfUsers.length === 0) {
                rooms.delete(room);
                console.log('deleted room', rooms);
            }
            else {
                console.log(arrayOfUsers);
            }

            id.delete(socket.id);
        }

    })

    // socket.on('typing', (username) => {
    //     socket.to(users.get(username)).emit('typing', `${username} is typing...`)
    //     console.log(`${username}`)
    // })

    socket.on('chat', (data) => {
        io.in(users.get(data.sender)).emit('message', `${data.sender}: ${data.message}`)
    })

})

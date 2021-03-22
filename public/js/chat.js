var socket = io();
var moment = moment();
const chatMessages = document.querySelector('.messages');
const messageField = document.getElementById('message');
const send = document.getElementById('send');


// Connection
socket.on('connect', () => {
    let username = localStorage.getItem('username');
    socket.emit('connectUser', (username));
})

// Redirect if no username is found or if someone's trying to make a room that already exists.
socket.on('redirect', (destination) => {
    window.location.replace(`http://${document.domain}:${location.port}/${destination}`)

})

send.addEventListener('click', () => {
    socket.emit('chat', {
        message: messageField.value,
        sender: localStorage.getItem('username'),
    });
    messageField.value = "";
    messageField.focus();
})


// Messages that the securo bot sends.
socket.on('botMessage', (message) => {
    console.log(message)
    outputMessage(message)
    chatMessages.scrollTop = chatMessages.scrollHeight;
})

// Messages that users send
socket.on('message', (message) => {
    console.log(message)
    outputMessage(message)
    chatMessages.scrollTop = chatMessages.scrollHeight;
})

// Output messages onto screen.
function outputMessage(message) {
    const div = document.createElement('div');
    div.classList.add('message');
    const addTime = document.createElement('div');
    addTime.innerText = moment.format('h:mm a');
    const p = document.createElement('p')
    p.classList.add('message-body')
    p.innerText = message;

    div.append(addTime);
    div.appendChild(p);
    document.querySelector('.messages').appendChild(div)
}
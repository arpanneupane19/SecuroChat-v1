var socket = io();
const chatMessages = document.querySelector('.messages');



// Connection
socket.on('connect', () => {
    let username = localStorage.getItem('username');
    socket.emit('connectUser', (username));
})

// form submits => socket.emit('message', {message: form.messageValue, sender: localStorageUsername})

// Messages that the securo bot sends.
socket.on('botMessage', (message) => {
    console.log(message)
    outputMessage(message)
    chatMessages.scrollTop = chatMessages.scrollHeight;
})



// Output messages onto screen.
function outputMessage(message) {
    const div = document.createElement('div');
    div.classList.add('message');
    const p = document.createElement('p')
    p.classList.add('message-body')
    p.innerText = message;

    div.appendChild(p);
    document.querySelector('.messages').appendChild(div)
}
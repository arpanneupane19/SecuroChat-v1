var socket = io();
const chatMessages = document.querySelector('.messages');
const form = document.querySelector('.input-field')

socket.on('connect', () => {
    let username = localStorage.getItem('username');
    socket.emit('connectUser', (username));
})

// socket.on('incomingMessage', (message) => {
//     console.log(message)
//     outputMessage(message)
//     chatMessages.scrollTop = chatMessages.scrollHeight;
// })


form.addEventListener('submit', (e) => {
    e.preventDefault()
    let message = e.target.elements.message.value;

    message = message.trim();

    socket.emit('message', message);

    // Clear input
    e.target.elements.message.value = '';
    e.target.elements.message.focus();
})


function outputMessage(message) {
    const div = document.createElement('div');
    div.classList.add('message');
    const p = document.createElement('p')
    p.classList.add('message-body')
    p.innerText = message;

    div.appendChild(p);
    document.querySelector('.messages').appendChild(div)
}
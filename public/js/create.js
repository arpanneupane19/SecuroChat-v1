const createForm = document.querySelector('.input-form');
const nameInput = document.querySelector('.name');
const codeInput = document.querySelector('.code');
const btn = document.querySelector('.submit');

var socket = io();


btn.addEventListener('click', () => {
    socket.emit('createRoom', {
        user: nameInput.value,
        roomCode: codeInput.value
    });

    window.location.replace(`http://${document.domain}:${location.port}/${codeInput.value}`)
})


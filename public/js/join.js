const createForm = document.querySelector('.input-form');
const nameInput = document.querySelector('.name');
const codeInput = document.querySelector('.code');
const btn = document.querySelector('.submit');

var socket = io();

btn.addEventListener('click', () => {
    socket.emit('joinRoom', {
        user: nameInput.value,
        roomCode: codeInput.value
    });
    localStorage.setItem('username', nameInput.value)


    window.location.replace(`http://${document.domain}:${location.port}/${codeInput.value}`)
})
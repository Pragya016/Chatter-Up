'use strict';

const formContainer = document.querySelector('form');
const messageInput = document.querySelector('#message-input');
const sendBtn = document.querySelector('#send-message');
const messageBox = document.querySelector('#message-box');

// This script will open a connection to the server
const socket = io('http://localhost:3000');

// getting the user's name
let username;
let hasEnteredName = false;

while (!hasEnteredName) {
    if (username === '' || !username) {
        username = prompt('Enter your name: ');
    } else {
        hasEnteredName = true;
    }
}

// emit this event when someone joins the chat
socket.emit('joinRoom', username);

// notify others that someone has joined the room
socket.on('systemMessage', (data) => {
    console.log(data)
    const welcomeDiv = document.createElement('div');
    welcomeDiv.className = 'welcome-msg'
    welcomeDiv.textContent = `${data.username} joined the conversation. \n ${data.users} people are in the chat.`
    messageBox?.appendChild(welcomeDiv);
})

// when user will send the message
formContainer.addEventListener('submit', (e) => {
    e.preventDefault();

    const message = messageInput.value;

    if (message.trim() === '') return;
        // this event will occue when user will send a message
        socket.emit('message', { message, username });
    
        messageInput.value = '';

        const newMessage = document.createElement('div');
        newMessage.className = "message"
        newMessage.textContent = `${username} : ${message}`;
    
        messageBox?.appendChild(newMessage);
})

// display messages to other members
socket.on('broadcast', (data) => {
    const newMessage = document.createElement('div');
    newMessage.className = "message"
    newMessage.textContent = `${data.username} : ${data.message}`;

    messageBox?.appendChild(newMessage);    
})
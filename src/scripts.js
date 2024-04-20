'use strict';

const formContainer = document.querySelector('form');
const messageInput = document.querySelector('#message-input');
const sendBtn = document.querySelector('#send-message');
const messageBox = document.querySelector('#message-box');

// to generate random profile picture
const API_URL = 'https://randomuser.me/api/'
let userProfilePicture;
async function getUserProfile() {
    try {
        const response = await fetch(API_URL);
        const data = await response.json();
        const pictureUrl = data.results[0].picture.medium;
        return pictureUrl
    } catch (error) {
        console.log(error)
    }
}

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
socket.emit('joinRoom', { username });

// notify others that someone has joined the room
socket.on('systemMessage', (data) => {
    getUserProfile().then(url => {
        const newChat = `<div class="chat-container">
        <img src=${url} alt="user-profile" class="user-profile">
        <div class="notify-message">${data.username.username} joined the chat.</div>
        </div><div class="message>${data.users}</div>`
        messageBox?.insertAdjacentHTML('afterbegin', newChat)
    })
})

// if input is empty, btn will be disabled

// when user will send the message
formContainer?.addEventListener('submit', (e) => {
    e.preventDefault();

    const message = messageInput.value;
    // current user msg is not displaying
    if (message.trim() === '') return;
    getUserProfile().then(url => {
        socket.emit('message', { message, username, profileUrl: url });
    
        // this event will occuer when user will send a message
        messageInput.value = '';

        const newMessage = `<div class="current-user-chat-container"> 
    <div class="new-message">${message}</div>
    <img src=${url} alt="user-img" class="user-profile"/>
        <div/> `

        messageBox?.insertAdjacentHTML('beforeend', newMessage)
    })
})

// display messages to other members
socket.on('broadcast', (data) => {
    const broadcastMsg = `<div class="broadcast-chat-container"> 
        <img src=${data.profileUrl} alt="user-img" class="user-profile"/>
        <div class="new-message">${data.message}</div>
        <div/> `

    messageBox?.insertAdjacentHTML('beforeend', broadcastMsg)
})


socket.on('userDisconnect', (users) => {
    const newMessage = document.createElement('div');
    newMessage.className = "message"
    newMessage.textContent = `A user left the chat. ${users} ${users > 1 ? 'users are' : "user is"} in the chat.`;

    messageBox?.appendChild(newMessage);
    console.log(newMessage);
})
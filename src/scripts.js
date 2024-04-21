'use strict';

const formContainer = document.querySelector('form');
const messageInput = document.querySelector('#message-input');
const sendBtn = document.querySelector('#send-message');
const messageBox = document.querySelector('#message-box');
const typingInfo = document.querySelector('#typingInfo');
const overflowContainer = document.querySelector('.overflow-container');

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

// automatically scroll to bottom when user will send a new message
function scrollToBottom() {
    overflowContainer.scrollTop = overflowContainer.scrollHeight;
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
getUserProfile().then(url => {
    socket.emit('joinRoom', { username, url });
})

// emit this event to display welcome message
socket.emit('register', username);

socket.emit('join');


let typingTimeout
// emit this event to notify other users that someone is typing
messageInput?.addEventListener('keypress', () => {
    socket.emit('typing', username);

    // Clear any existing typingTimeout before starting a new one
    clearTimeout(typingTimeout);
    typingTimeout = setTimeout(() => {
        socket.emit('stop_typing');
    }, 500); // 3000 milliseconds delay before sending 'stop_typing'
});

// Handle the 'typing' event from the server
socket.on('typing', username => {
    typingInfo.textContent = `${username} is typing`;

    // Clear the typing message after 3 seconds
    clearTimeout(typingTimeout);
    typingTimeout = setTimeout(() => {
        typingInfo.textContent = '';
    }, 3000);
});

socket.on('stop_typing', () => {
    typingInfo.textContent = '';
});

socket.on('welcome', msg => {
    const container = document.createElement('div');
    container.className = 'message';
    container.textContent = msg;

    messageBox?.append(container);
    scrollToBottom()
})

// notify others that someone has joined the room
socket.on('systemMessage', (data) => {
        const newChat = `<div class="chat-container">
        <img src=${data.profileUrl} alt="user-profile" class="user-profile">
        <div class="notify-message">${data.username} joined the chat.</div>
        </div><div class="message>${data.users}</div>`

        messageBox?.insertAdjacentHTML('beforeend', newChat)
        scrollToBottom()
    })

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
    })
})

socket.on('displayMessage', (data) => {
    const newMessage = `<div class="current-user-chat-container"> 
    <div class='message-container'>
    <div class="cur-user-message">${data.message}</div>
    <div class="cur-user-time">${data.time}</div>
    </div>
    <img src=${data.profileUrl} alt="user-img" class="user-profile"/>
        <div/> `

    messageBox?.insertAdjacentHTML('beforeend', newMessage)
    scrollToBottom()
})

// display messages to other members
socket.on('broadcast', (data) => {
    const broadcastMsg = `<div class="broadcast-chat-container"> 
        <img src=${data.profileUrl} alt="user-img" class="user-profile"/>
        <div class='message-container'>
        <div class="new-message">${data.message}</div>
        <div class="time">${data.time}</div>
        <div/><div/> `
    messageBox?.insertAdjacentHTML('beforeend', broadcastMsg)

    scrollToBottom()
})


socket.on('userDisconnect', (users) => {
    const newMessage = document.createElement('div');
    newMessage.className = "message"
    newMessage.textContent = `A user left the chat. ${users} ${users > 1 ? 'users are' : "user is"} in the chat.`;

    messageBox?.appendChild(newMessage);
    scrollToBottom()
})

socket.on('load_messages', (data) => {
    data.forEach(userData => {
        const broadcastMsg = `<div class="broadcast-chat-container"> 
        <img src=${userData.profileUrl} alt="user-img" class="user-profile"/>
        <div class='message-container'>
        <div class="new-message">${userData.message}</div>
        <div class="time">${userData.time}</div>
        <div/><div/> `
        messageBox?.insertAdjacentHTML('afterbegin', broadcastMsg)
        scrollToBottom();
    });
});
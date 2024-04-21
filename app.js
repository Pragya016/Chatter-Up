// I have added some extra functionalities such as when user will send or recieve a message,
// it will automatically scroll to bottom etc.


import express from 'express';
import { createServer } from 'http';
import { Server } from 'socket.io';
import cors from 'cors';
import connectToMongoose from './config/mongoose.config.js';
import { chatModel } from './schema/chat.schema.js';

const app = express();
const http = createServer(app);
const io = new Server(http, {
    cors: {
        origin: '*',
        methods: ['GET', 'POST']
    }
});

io.on('connection', (socket) => {
    console.log('A user connected');

    socket.on('joinRoom', async (data) => {
        const date = new Date();
        const formattedMinutes = String(date.getMinutes()).padStart(2, '0');
        const curTime = `${date.getHours()}:${formattedMinutes}${date.getHours() > 12 ? 'pm' : 'am'}`;

        // Find existing user or create new one on join, setting profileUrl initially
        const user = await chatModel.findOneAndUpdate(
            { username: data.username },
            { $setOnInsert: { username: data.username, profileUrl: data.url, time: curTime } },
            { upsert: true, new: true, setDefaultsOnInsert: true }
        );

        socket.broadcast.emit('systemMessage', { username: data.username, profileUrl: user.profileUrl, message: data.message });
    });

    socket.on('register', (username) => {
        socket.emit('welcome', `Welcome to the chat, ${username}!`);
    });

    socket.on('typing', (username) => {
        socket.broadcast.emit('typing', username);
    });

    socket.on('stop_typing', () => {
        socket.emit('stop_typing');
    });

    socket.on('join', async () => {
        // Send old messages to the client
        try {
            const msgs = await chatModel.find().sort({ time: 1 }).limit(50);
            socket.emit('load_messages', msgs);
        } catch (error) {
            console.log(error);
        }
    });

    socket.on('message', async (data) => {
        const date = new Date();
        const formattedMinutes = String(date.getMinutes()).padStart(2, '0');
        const hour = date.getHours();
        const isPM = hour >= 12;
        const formattedHour = hour % 12 === 0 ? 12 : hour % 12;  // Adjust 0 hour to 12 for 12 AM/PM
        const curTime = `${formattedHour}:${formattedMinutes}${isPM ? 'pm' : 'am'}`;

        // Update message, reusing profileUrl from existing record
        const user = await chatModel.findOneAndUpdate(
            { username: data.username },
            { $set: { message: data.message, time: curTime } },
            { new: true }
        );
;
        socket.broadcast.emit('broadcast', user);
        socket.emit('displayMessage', user);
    });

    socket.on('disconnect', () => {
        console.log('User disconnected');
    });
});

http.listen(3000, () => {
    connectToMongoose();
    console.log('Server listening on port 3000');
});

import express from 'express';
import { createServer } from 'http';
import { Server } from 'socket.io';
import cors from 'cors'

import connectToMongoose from './config/mongoose.config.js';
import { chatModel } from './schema/chat.schema.js';

const app = express();
const http = createServer(app)
const io = new Server(http, {
    cors: {
        origin: '*',
        methods:['GET', 'POST']
    }
});

let users = 0;

// Map to store user counts for each room
const roomUserCounts = new Map();

io.on('connection', (socket) => {
    console.log('A user connected');
    users++;

    // this event will occur when user will join the room
    socket.on('joinRoom', (username) => {
        socket.broadcast.emit('systemMessage', { username: username, users })
    })

    // this event will help to display the welcome message
    socket.on('register', (username) => {
        console.log(`${username} registered`);
        socket.emit('welcome', `Welcome to the chat, ${username}!`);
    });

    // this event wll help to notify other users that someone is typing
    socket.on('typing', (username) => {
        socket.broadcast.emit('typing', username);
    })

    socket.on('stop_typing', () => socket.emit('stop_typing'))

    socket.on('join', async (data) => {
        // send old massages to the client
        await chatModel.find().sort({ time: 1 }).limit(50).then(msgs => {
            try {
                console.log(msgs)
                socket.emit('load_messages', msgs);
            } catch (error) {
                console.log(error)
            }
        });
    })

    socket.on('message', async (data) => {
        try {

            const date = new Date();
            const curTime = `${date.getHours()}:${date.getMinutes()}${date.getHours() > 12 ? 'pm' : 'am'}`;
            console.log(curTime)
            let obj = {
                message: data.message,
                username: data.username,
                profileUrl: data.profileUrl,
                time: curTime
            }

            const user = await chatModel.findOne({ username: obj.username });

            let newMessage;
            if (!user) {
                newMessage = new chatModel(obj)
                await newMessage.save();
            } else {
                obj.profileUrl = user.profileUrl;
                const newMessage = new chatModel(obj);
                await newMessage.save();
            }

            socket.broadcast.emit('broadcast', obj);
            socket.emit('displayMessage', obj)
        } catch (err) {
            console.log(err);
        }
    });

    socket.on('disconnect', () => {
        users--;
        socket.broadcast.emit('userDisconnect', users)
        console.log('User disconnected');
    });
});

// Listen on the HTTP server, not the express app
http.listen(3000, () => {
    connectToMongoose();
    console.log('Server listening on port 3000');
});
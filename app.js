import express from 'express';
import { createServer } from 'http';
import { Server } from 'socket.io';
import cors from 'cors'

import connectToMongoose from './config/mongoose.config.js';
import { chatModel } from './schema/chat.schema.js';
import { timeStamp } from 'console';

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

    // create room
    // socket.on('joinRoom', (roomName) => {
    //     if (!roomUserCounts.has(roomName)) {
    //         // If room doesn't exist, initialize user count for the room
    //         roomUserCounts.set(roomName, 0);
    //     }

    //     // check if room has reached its limit
    //     if (roomUserCounts.get(roomName) < 2) {
    //          // Increment user count for the room
    //         roomUserCounts.set(roomName, roomUserCounts.get(roomName) + 1);

    //         // join the room
    //         socket.join(roomName);

    //         // Emit join message to the room
    //         io.to(roomName).emit('systemMessage', {
    //             text: `${socket.username} joined the conversation`,
    //             sender: 'System'
    //         });
    //     }
    // })

    // this event will occur when user will join the room
    socket.on('joinRoom', username => {
        socket.broadcast.emit('systemMessage', {username, users})
    })


    socket.on('join', (data) => {
        socket.username = data;

        // send old massages to the client
        chatModel.find().sort({ timeStamp: 1 }).limit(50).then(msgs => {
            try {
                socket.emit('load_messages', msgs);
            } catch (error) {
                console.log(error)
            }
        });
    })

    // You can emit and listen for custom events
    socket.on('message', (data) => {
        try {
            let obj = {
                message: data.message,
                username: data.username,
                timeStamp: new Date()
            }

            const newMessage = new chatModel(obj)
            newMessage.save();
            socket.broadcast.emit('broadcast', obj);
        } catch (err) {
            console.log(err);
        }
    });

    socket.on('disconnect', () => {
        users--;
        socket.broadcast.emit('userDisconnect')
        console.log('User disconnected');
    });
});

// Listen on the HTTP server, not the express app
http.listen(3000, () => {
    connectToMongoose();
    console.log('Server listening on port 3000');
});
import mongoose from "mongoose";

const chatSchema = new mongoose.Schema({
    username: String,
    message: String,
    profileUrl : String,
    time: String
})

export const chatModel = mongoose.model('Chat', chatSchema);
import mongoose from "mongoose";

const API_URL = 'mongodb://localhost:27017/chatter-up-database';

export default async function connectToMongoose() {
    await mongoose.connect(API_URL);

    console.log('connected to database.')
}
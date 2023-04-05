// Tryout of writing model.js file in user folder of API
import { Schema } from "mongoose";

const roles = ['user', 'admin'];

const userSchema = new Schema({
    email: {
        type: String,
        match: /^\S+@\S+\.\S+$/,
        require: true,
        unique: true,
        trim: true,
        tolowercase: true,
    },
    password: {
        type: String,
        required: true,
        minlength: 6,
    },
    name: {
        type: String,
        index: true,
        trim: true,
    },
    services: {
        facebook: String,
        github: String,
        google: String,
    },
    role: {
        type: String,
        enum: roles,
        default: 'user',
    },
    picture: {
        type: String,
        trim: true,
    },
    timeStamp: true,
});
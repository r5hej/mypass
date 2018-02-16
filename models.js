"use strict";

const mongoose = require("mongoose");

let UserSchema = new mongoose.Schema({
    username: {type: String, required: true, index: { unique: true }},
    password: {type: String, required: true},
    admin: {type: Boolean, default: false}
});

let CredentialSchema = new mongoose.Schema({
    category_id: {type: mongoose.Schema.Types.ObjectId, required: true},
    location: {type: String, required: true},
    description: String,
    username: {type: String, required: false},
    password: {type: String, required: true}
});

let CategorySchema = new mongoose.Schema({
    owner: {type: String, required: true},
    name: {type: String, required: true},
});

let RegisterTokenSchema = new mongoose.Schema({
    created: {type: Date, required: true}
});


let User = mongoose.model('User', UserSchema);
let Credential = mongoose.model('Credential', CredentialSchema);
let Category = mongoose.model('Category', CategorySchema);
let RegisterToken = mongoose.model('RegisterToken', RegisterTokenSchema);

module.exports = {
    User,
    Category,
    Credential,
    RegisterToken
};

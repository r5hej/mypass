"use strict";

const express = require('express');
const app = express();

const auth = require('./authentication.js');


const MongoClient = require('mongodb').MongoClient;
const url = "mongodb://localhost:27017/mypass";

const crypto = require('crypto'),
    algorithm = 'aes-256-ctr',
    password = 'd6F3Efeq';


function encrypt(text) {
    let cipher = crypto.createCipher(algorithm,password);
    let crypted = cipher.update(text,'utf8','hex');
    crypted += cipher.final('hex');
    return crypted;
}

function decrypt(text) {
    let decipher = crypto.createDecipher(algorithm,password);
    let dec = decipher.update(text,'hex','utf8');
    dec += decipher.final('utf8');
    return dec;
}

// app.listen(3000, () => {
//     console.log("Server started on port 3000");
// });
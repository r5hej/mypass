"use strict";

const express = require('express');
const app = express();

const MongoClient = require('mongodb').MongoClient;
const url = "mongodb://localhost:27017/mypass";

const crypto = require('crypto'),
    algorithm = 'aes-256-ctr',
    password = 'd6F3Efeq';

const bcrypt = require('bcrypt');
const saltRounds = 10;

function UserAuth(username, password) {
    GetUserFromDb(username, function(user) {
        if (user == null) {
            console.log("user not found during login");
            return;
        }

        let res = bcrypt.compareSync(password, user.password);
        if (res) {
           console.log("passwords are the same");
        }
        else {
            console.log("passwords are not the same");
        }
    });
}

function GetUserFromDb(username, callback) {
    MongoClient.connect(url, function (err, db) {
        if (err) throw err;
        const mypass = db.db('mypass');

        mypass.collection("users").findOne({username: username}, function(err, result) {
            if (err) throw err;
            db.close();
            callback(result);
        });
    });
}

function HashPassword(password) {
    let salt = bcrypt.genSaltSync(saltRounds);
    let hash = bcrypt.hashSync(password, salt);
    return hash;
}

function AddNewUser(username, password) {
    MongoClient.connect(url, function(err, db) {
        if (err) throw err;
        const mypass = db.db('mypass');

        let user = {
            username: username,
            password: HashPassword(password)
        };

        mypass.collection("users").insertOne(user, function(err, res) {
            if (err) throw err;
            db.close();
        });
    });
}

function AddPassword(user, password) {
    MongoClient.connect(url, function (err, db) {
        if (err) throw err;
        const mypass = db.db('mypass');

        mypass.collection('passwords').insertOne(password, function (err, res) {
            if (err) throw err;
            db.close();
        })
    });
}

function encrypt(text){
    let cipher = crypto.createCipher(algorithm,password);
    let crypted = cipher.update(text,'utf8','hex');
    crypted += cipher.final('hex');
    return crypted;
}

function decrypt(text){
    let decipher = crypto.createDecipher(algorithm,password);
    let dec = decipher.update(text,'hex','utf8');
    dec += decipher.final('utf8');
    return dec;
}


// app.listen(3000, () => {
//     console.log("Server started on port 3000");
// });
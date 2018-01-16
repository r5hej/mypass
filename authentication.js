"use strict";

const MongoClient = require('mongodb').MongoClient;
const fs = require('fs');
const bcrypt = require('bcrypt');
const saltRounds = 10;
let url;

fs.readFile('config.json', 'utf8', function(err, data) {
    if (err) throw err;
    let json = JSON.parse(data);
    url = json.mongoURL + "/mypass";
});


function authUser(username, password, callback) {
    fetchUserFromDb(username, user => {
        if (!user)
            callback(null);
        else
            bcrypt.compare(password, user.password, (err, res) => callback((!err && res) ? user : null));
    });
}


function fetchUserFromDb(username, callback) {
    MongoClient.connect(url, function (err, db) {
        if (err) throw err;
        const mypass = db.db("mypass");

        mypass.collection("users").findOne({username: username}, function(err, result) {
            if (err) throw err;
            db.close();
            callback(result);
        });
    });
}

function hashPassword(password, callback) {
    bcrypt.genSalt(saltRounds, (err, salt) => {
        bcrypt.hash(password, salt, callback);
    });
}

function addNewUser(username, password) {
    MongoClient.connect(url, (err, db) => {
        if (err) throw err;
        const mypass = db.db('mypass');
        hashPassword(password, (err, hash) => {
            if (err) throw err;
            let user = {
                username: username,
                password: hash
            };
            mypass.collection("users").insertOne(user, (err, res) => {
                if (err) throw err;
                db.close();
            });
        });
    });
}


// unused?
function addPassword(user, password) {
    MongoClient.connect(url, function (err, db) {
        if (err) throw err;
        const mypass = db.db('mypass');

        mypass.collection('passwords').insertOne(password, function (err, res) {
            if (err) throw err;
            db.close();
        })
    });
}



module.exports = {
    authUser,
    addNewUser
};
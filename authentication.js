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

module.exports = {
    authUser: function(username, password, callback) {
        let result;
        fetchUserFromDb(username, function(user) {
            (user != null && bcrypt.compareSync(password, user.password)) ? result = user : result = null;
            callback(result);
        });
    },
    addNewUser: (username, password) => addNewUser(username, password)
};

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

function hashPassword(password) {
    let salt = bcrypt.genSaltSync(saltRounds);
    let hash = bcrypt.hashSync(password, salt);
    return hash;
}

function AadNewUser(username, password) {
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

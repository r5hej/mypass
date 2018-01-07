"use strict";

const MongoClient = require('mongodb').MongoClient;

const bcrypt = require('bcrypt');
const saltRounds = 10;

module.exports= {
    AuthUser: function(url, username, password) {
        FetchUserFromDb(url, username, function(user) {
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
};

function FetchUserFromDb(url, username, callback) {
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

function AddNewUser(url, username, password) {
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

function AddPassword(url, user, password) {
    MongoClient.connect(url, function (err, db) {
        if (err) throw err;
        const mypass = db.db('mypass');

        mypass.collection('passwords').insertOne(password, function (err, res) {
            if (err) throw err;
            db.close();
        })
    });
}

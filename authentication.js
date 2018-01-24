"use strict";

const MongoClient = require('mongodb').MongoClient;
const fs = require('fs');
const bcrypt = require('bcrypt');
const saltRounds = 10;

let data = fs.readFileSync('config.json', 'utf8');
const config = JSON.parse(data);

async function hashPassword(password) {
    let salt = bcrypt.genSalt(saltRounds);
    return await bcrypt.hash(password, salt);
}


async function fetchUserFromDb(username) {
    let db = await MongoClient.connect(config.mongoURL);
    let collection = db.db("mypass").collection("users");
    let user = await collection.findOne({username});
    db.close();
    return user;
}

async function authUser(username, password,) {
    let user = await fetchUserFromDb(username);
    if (user && await bcrypt.compare(password, user.password))
        return user;
    return null;
}

async function addNewUser(username, password) {
    let db = await MongoClient.connect(config.mongoURL);
    let collection = db.db("mypass").collection("users");
    let user = await collection.findOne({username});
    if (user)
        return false;
    let hash = await hashPassword(password);
    user = {
        username: username,
        password: hash
    };
    await collection.insertOne(user);
    db.close();
    return user;
}

// unused?
// function addPassword(user, password) {
//     MongoClient.connect(config.mongoURL, function (err, db) {
//         if (err) throw err;
//         const mypass = db.db('mypass');
//
//         mypass.collection('passwords').insertOne(password, function (err, res) {
//             if (err) throw err;
//             db.close();
//         })
//     });
// }

module.exports = {
    authUser,
    addNewUser
};
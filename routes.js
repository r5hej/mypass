"use strict";

const express = require('express');
const bodyparser = require('body-parser');
const app = express();
const auth = require('./authentication.js');
const crypto = require('./crypto.js');
const path = require('path');

app.use(express.static(__dirname));
app.use(bodyparser.json);
app.use(bodyparser.urlencoded({ extended: true }));

// const dbUrl = "mongodb://localhost:27017/mypass";

app.get('/', (req, res) => {
    res.redirect('/login');
});

app.get('/login', (req, res) => {
    res.sendFile('index.html');
});

app.post('/login/user', (req, res) => {
    let user = req.body.user;
    console.log(user);
    console.log(user.username);
    console.log(user.password);
    if (user.username == "r5hej" && user.password == "password") {
        res.send("Correct user");
    }
    else {
        res.send("False user");
    }
});

app.listen(3000, () => {
    console.log("Server started on port 3000");
});

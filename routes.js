"use strict";

const express = require('express');
const app = express();
const auth = require('./authentication.js');
const crypto = require('./crypto.js');
const path = require('path');

app.use(express.static(__dirname));

const dbUrl = "mongodb://localhost:27017/mypass";

app.get('/', (req, res) => {
    res.redirect('/login');
});

app.get('/login', (req, res) => {
    res.sendFile('index.html');
});

app.listen(3000, () => {
    console.log("Server started on port 3000");
});
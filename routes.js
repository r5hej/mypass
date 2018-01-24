"use strict";

const express = require('express');
const session = require('express-session');
const yields = require('express-yields');
const formidable = require('express-formidable');
const auth = require('./authentication.js');
const buckets = require('./buckets.js');

const app = express();
app.use(express.static('public'));
app.use(formidable());
app.use(session({
    secret: "Charlie's engle",
    resave: false,
    saveUninitialized: false,
    cookie: {
        maxAge: 604800000, // 7 days in milliseconds
        sameSite: 'strict'
    }
}));


const sessAuth = function(req, res, next) {
    if (req.session && req.session.username)
        return next();
    else {
        return res.sendStatus(401);
    }
};


app.post('/login', async (req, res) => {
    let user = await auth.authUser(req.fields.username, req.fields.password);
    if (user){
        req.session.username = user.username;
        res.send("OK");
    }
    else{
        res.sendStatus(401);
    }
});

app.get('/buckets', sessAuth, async (req, res) => {
    let bucketData = await buckets.getUsersBuckets(req.session.username);
    res.send(bucketData);
});

app.post('/logout', sessAuth, async (req, res) => {
    req.session.destroy();
    res.send("logout success!");
});

app.post('/buckets/add', sessAuth, async (req, res) => {
    let bucket = await buckets.addNewBucket(req.fields, req.session.username);
    console.log(bucket);
    res.send(bucket);
});

app.post('/buckets/update', sessAuth, async (req, res) => {
    let result = await buckets.updateBucket(req.fields, req.session.username);
    res.send(result);
});

app.listen(3000, () => {
    console.log("Server started on port 3000");
});

"use strict";

const express = require('express');
const session = require('express-session');
//const yields = require('express-yields');
const formidable = require('express-formidable');
// const auth = require('./authentication.js');
// const buckets = require('./buckets.js');
const models = require("./models");
const bcrypt = require('bcrypt');
const saltRounds = 10;

async function hashPassword(password) {
    let salt = bcrypt.genSalt(saltRounds);
    return await bcrypt.hash(password, salt);
}

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
    let user = await models.User.findOne({username: req.fields.username});
    if (user && await bcrypt.compare(req.fields.password, user.password)){
        req.session.username = user.username;
        res.send("OK");
    }
    else{
        res.sendStatus(401);
    }
});


app.get('/credentials', sessAuth, async (req, res) => {

});
app.post('/credential', sessAuth, async (req, res) => {

});
app.delete('/credential', sessAuth, async (req, res) => {

});
app.put('/credential', sessAuth, async (req, res) => {

});


app.get('/categories', sessAuth, async (req, res) => {

});
app.post('/category', sessAuth, async (req, res) => {

});
app.delete('/category', sessAuth, async (req, res) => {

});
app.put('/category', sessAuth, async (req, res) => {

});

app.get('/buckets', sessAuth, async (req, res) => {
    let bucketData = await models.Bucket.find({owner: req.session.username});
    bucketData.forEach(b => delete b.owner);
    res.send(bucketData);
});

app.post('/logout', sessAuth, async (req, res) => {
    req.session.destroy();
    res.send("OK");
});

app.post('/buckets/add', sessAuth, async (req, res) => {
    let bucket = new models.Bucket(req.fields, true);
    bucket.owner = req.session.username;
    await bucket.save();
    console.log(bucket);
    res.send(bucket);
});

app.post('/buckets/update', sessAuth, async (req, res) => {
    let bucket = await models.Bucket.findOne({_id: req.fields._id});
    bucket.name = req.fields.name;
    bucket.credentials = req.fields.credentials;
    let saved = await bucket.save();
    // let result = await buckets.updateBucket(req.fields, req.session.username);
    res.send(saved);
});
app.post('/buckets/delete', sessAuth, async (req, res) => {
    await models.Bucket.delete({_id: req.fields._id});
    res.send("OK");
});

app.listen(3000, () => {
    console.log("Server started on port 3000");
});

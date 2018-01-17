"use strict";

const express = require('express');
// const bodyparser = require('body-parser');
const formidable = require('express-formidable');
const auth = require('./authentication.js');
const buckets = require('./buckets.js');
const path = require('path');

const app = express();
app.use(express.static('public'));
// app.use(express.static(path.join(__dirname, 'public')));
app.use(formidable());

// app.use(bodyparser.json());
// app.use(bodyparser.urlencoded({ extended: false}));


app.post('/login', (req, res) => {
    auth.authUser(req.fields.username, req.fields.password, result => {
        if (result)
            res.send(result);
        else
            res.sendStatus(401);
    });
});

app.post('/login/user', (req, res) => {
    let user = req.body;
    auth.authUser(user.username, user.password, function(result) {
        result == null?
            res.send(JSON.stringify({"response": 401})) :
            res.send(JSON.stringify({"response": 200, "user": result}));
    });
});

// buckets
app.post('/bucket', (req, res) => {
    buckets.getUsersBuckets(req.body.username, (result) => {
        res.send(result);
    });
});

app.post('/bucket/add', (req, res) => {
    let bucket = req.body;
    buckets.addNewBucket(bucket, result => {
        res.send({"response": result.result.ok === 1 ? 200 : null})
    });
});

app.listen(3000, () => {
    console.log("Server started on port 3000");
});

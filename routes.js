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
            buckets.getUsersBuckets(req.fields.username, buckets => {
                res.send(buckets);
            });
        else
            res.sendStatus(401);
    });
});


app.post('/bucket/add', (req, res) => {
    buckets.addNewBucket(req.fields, result => {
        res.send(JSON.stringify(result ? result.ops[0]._id : "failed"))
    });
});

app.post('/bucket/update', (req, res) => {
    buckets.updateBucket(req.fields, result => {
        res.send(JSON.stringify(result ? "success" : "failed"));
    });
});

app.listen(3000, () => {
    console.log("Server started on port 3000");
});
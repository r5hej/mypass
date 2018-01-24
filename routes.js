"use strict";

const express = require('express');
const yields = require('express-yields');
const formidable = require('express-formidable');
const auth = require('./authentication.js');
const buckets = require('./buckets.js');

const app = express();
app.use(express.static('public'));
app.use(formidable());

app.post('/login', async (req, res) => {
    console.log("login", req.fields.username);
    let user = await auth.authUser(req.fields.username, req.fields.password);
    console.log(user.username);
    if (user){
        let bucketData = await buckets.getUsersBuckets(user.username);
        res.send(bucketData);
    }
    else
        res.sendStatus(401);
});

app.post('/bucket/add', async (req, res) => {
    let bucket = await buckets.addNewBucket(req.fields);
    if (bucket)
        res.send(bucket.ops[0]._id);
    buckets.addNewBucket(req.fields, result => {
        res.send(JSON.stringify(result ? result.ops[0]._id : "failed"))
    });
});

app.post('/bucket/update', async (req, res) => {
    buckets.updateBucket(req.fields, result => {
        res.send(JSON.stringify(result ? "success" : "failed"));
    });
});

app.listen(3000, () => {
    console.log("Server started on port 3000");
});

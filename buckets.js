"use strict";

const MongoClient = require('mongodb').MongoClient;
const ObjectId = require('mongodb').ObjectId;
const fs = require('fs');
let url;
fs.readFile('config.json', 'utf8', function(err, data) {
    if (err) throw err;
    let json = JSON.parse(data);
    url = json.mongoURL + "/mypass";
});

function getUsersBuckets(username, callback) {
    MongoClient.connect(url, (err, db) => {
        if (err) throw err;
        const mypass = db.db("mypass");

        mypass.collection("buckets").find({owner: username}).toArray(function(err, result) {
            if (err) throw err;
            db.close();
            callback(result);
        });
    });
}

function updateBucket(data, callback) {
    MongoClient.connect(url, (err, db) => {
        if (err) throw err;
        const mypass = db.db("mypass");

        let newData = {
            $set: {
                owner: data.owner,
                name: data.name,
                passwords: data.passwords
            }
        };

        mypass.collection("buckets").updateOne({_id: new ObjectId(data._id)}, newData, (err, result) => {
            if (err) throw err;
            db.close();
            callback(result);
        });
    });
}

// needs to return bucket id
function addNewBucket(bucket, callback) {
    MongoClient.connect(url, function (err, db) {
        if (err) throw err;
        const mypass = db.db("mypass");

        mypass.collection("buckets").insertOne(bucket, function(err, result) {
            if (err) throw err;
            db.close();
            callback(result);
        });
    });
}


module.exports = {
    getUsersBuckets,
    updateBucket,
    addNewBucket
};
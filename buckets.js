"use strict";

const MongoClient = require('mongodb').MongoClient;
const fs = require('fs');
let url;
fs.readFile('config.json', 'utf8', function(err, data) {
    if (err) throw err;
    let json = JSON.parse(data);
    url = json.mongoURL + "/mypass";
});

module.exports = {
    getUsersBuckets: function(username, callback) {
        MongoClient.connect(url, function (err, db) {
            if (err) throw err;
            const mypass = db.db("mypass");

            mypass.collection("buckets").find({username: username}).toArray(function(err, result) {
                if (err) throw err;
                db.close();
                callback(result);
            });
        });
    },
    addNewBucket: function(bucket, callback) {
        MongoClient.connect(url, function (err, db) {
            if (err) throw err;
            const mypass = db.db("mypass");

            mypass.collection("buckets").insertOne(bucket, function(err, result) {
                if (err) throw err;
                db.close();
                callback(result);
                // callback(result);
            });
        });
    }
};

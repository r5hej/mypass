"use strict";

const MongoClient = require('mongodb').MongoClient;
const ObjectId = require('mongodb').ObjectId;
const fs = require('fs');
let data = fs.readFileSync('config.json', 'utf8');
const config = JSON.parse(data);


async function getUsersBuckets(username) {
    let db = await MongoClient.connect(config.mongoURL);
    let collection = db.db("mypass").collection("buckets");
    let buckets = await collection.find({owner: username});
    let bucketArray = await buckets.toArray();
    db.close();
    return bucketArray;
}

async function updateBucket(data, username) {
    let db = await MongoClient.connect(config.mongoURL);
    let collection = db.db("mypass").collection("buckets");
    let newData = {
        $set: {
            owner: username,
            name: data.name,
            passwords: data.passwords
        }
    };

    let result = await collection.updateOne({_id: new ObjectId(data._id)}, newData);
    db.close();
    return result;
}

// needs to return bucket id
async function addNewBucket(bucket, username) {
    let db = await MongoClient.connect(config.mongoURL);
    let collection = db.db("mypass").collection("buckets");
    bucket.owner = username;
    let result = await collection.insertOne(bucket);

    db.close();
    return result.ops[0];
}


module.exports = {
    getUsersBuckets,
    updateBucket,
    addNewBucket
};
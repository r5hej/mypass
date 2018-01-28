const mongoose = require("mongoose");

let UserSchema = new mongoose.Schema({
    username: String,
    password: String
});

let CredentialSchema = new mongoose.Schema({
    location: String,
    description: String,
    username: String,
    password: String
});

let BucketSchema = new mongoose.Schema({
    owner: String,
    name: String,
    credentials: [CredentialSchema]
});



let User = mongoose.model('User', UserSchema);
let Credential = mongoose.model('Credential', CredentialSchema);
let Bucket = mongoose.model('Item', BucketSchema);

mongoose.connect('mongodb://localhost/mypass');

module.exports = {
    User,
    Bucket,
    Credential
};
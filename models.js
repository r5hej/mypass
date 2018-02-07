const mongoose = require("mongoose");

let UserSchema = new mongoose.Schema({
    username: String,
    password: String
});

let CredentialSchema = new mongoose.Schema({
    category_id: mongoose.Schema.Types.ObjectId,
    location: String,
    description: String,
    username: String,
    password: String
});

let CategorySchema = new mongoose.Schema({
    owner: String,
    name: String,
});


let User = mongoose.model('User', UserSchema);
let Credential = mongoose.model('Credential', CredentialSchema);
let Category = mongoose.model('Category', CategorySchema);

mongoose.connect('mongodb://localhost/mypass');

module.exports = {
    User,
    Category,
    Credential
};
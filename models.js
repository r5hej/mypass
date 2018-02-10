const mongoose = require("mongoose");
const fs = require("fs");

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

let RegisterTokenSchema = new mongoose.Schema({
    created: Date
});


let User = mongoose.model('User', UserSchema);
let Credential = mongoose.model('Credential', CredentialSchema);
let Category = mongoose.model('Category', CategorySchema);
let RegisterToken = mongoose.model('RegisterToken', RegisterTokenSchema);

module.exports = {
    User,
    Category,
    Credential,
    RegisterToken
};

fs.readFile(__dirname + '/config.json', (err, data) => {
    if (err)
        mongoose.connect('mongodb://localhost/mypass');
    else{
        mongoose.connect(JSON.parse(data).mongoURL);
    }
});

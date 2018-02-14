const mongoose = require("mongoose");
const fs = require("fs");

let UserSchema = new mongoose.Schema({
    username: {type: String, required: true, index: { unique: true }},
    password: {type: String, required: true}
});

let CredentialSchema = new mongoose.Schema({
    category_id: {type: mongoose.Schema.Types.ObjectId, required: true},
    location: {type: String, required: true},
    description: String,
    username: {type: String, required: true},
    password: {type: String, required: true}
});

let CategorySchema = new mongoose.Schema({
    owner: {type: mongoose.Schema.Types.ObjectId, required: true},
    name: {type: String, required: true},
});

let RegisterTokenSchema = new mongoose.Schema({
    created: {type: Date, required: true}
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
        try{
            let settings = JSON.parse(data);
            mongoose.connect(settings.mongoURL);
        }
        catch (err) {
            console.log("Invalid config file");
        }
    }
});

"use strict";

const express = require('express');
const session = require('express-session');
//const yields = require('express-yields');
const formidable = require('express-formidable');
const models = require("./models");
const bcrypt = require('bcrypt');
const saltRounds = 10;

async function hashPassword(password) {
    let salt = bcrypt.genSalt(saltRounds);
    return await bcrypt.hash(password, salt);
}

const app = express();
app.use(express.static('public'));
app.use(formidable());
app.use(session({
    secret: "Charlie's engle",
    resave: false,
    saveUninitialized: false,
    cookie: {
        maxAge: 604800000, // 7 days in milliseconds
        sameSite: 'strict'
    }
}));


const sessAuth = function(req, res, next) {
    if (req.session && req.session.username)
        return next();
    else {
        return res.sendStatus(401);
    }
};


app.post('/login', async (req, res) => {
    let user = await models.User.findOne({username: req.fields.username});
    if (user && await bcrypt.compare(req.fields.password, user.password)){
        req.session.username = user.username;
        res.send("OK");
    }
    else{
        res.sendStatus(401);
    }
});

app.post('/logout', sessAuth, async (req, res) => {
    req.session.destroy();
    res.send("OK");
});

app.post('/credential', sessAuth, async (req, res) => {
    let credential = new models.Credential(req.fields, true);
    await credential.save();
    res.send(credential);
});

app.delete('/credential', sessAuth, async (req, res) => {
    let deleted = await models.Credential.remove({_id: req.fields._id});
    res.send(deleted);
});

app.put('/credential', sessAuth, async (req, res) => {
    let saved = await models.Credential.findOneAndUpdate({_id: req.fields._id}, req.fields).lean();
    res.send(saved);
});

app.get('/categories', sessAuth, async (req, res) => {
    let categories = await models.Category.find({owner: req.session.username}).lean();
    for (let i = 0; i < categories.length; i++){
        let category = categories[i];
        category.credentials = await models.Credential.find({category_id: category._id}).lean();
        delete category.owner;
    }
    // res.send(JSON.stringify(categories));
    res.send(categories);
});

app.post('/category', sessAuth, async (req, res) => {
    let category = new models.Category(req.fields, true);
    category.owner = req.session.username;
    await category.save();
    res.send(category);
});

app.delete('/category', sessAuth, async (req, res) => {
    let deletedCat = await models.Category.remove({_id: req.fields._id});
    let deletedCreds = await models.Credential.remove({category_id: req.fields._id});
    res.send(deletedCat && deletedCreds);
});

app.put('/category', sessAuth, async (req, res) => {
    let saved = await models.Category.update({_id: req.fields._id}, req.fields);
    res.send(saved);
});

app.listen(3000, () => {
    console.log("Server started on port 3000");
});

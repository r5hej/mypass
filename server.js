"use strict";

const express = require("express");
const session = require("express-session");
const formidable = require("express-formidable");
const models = require("./models");
const init = require("./init");
const fs = require("fs");
const bcrypt = require("bcrypt");

console.log("Starting MyPass...");

const saltRounds = 10;
const app = express();
app.use(express.static(__dirname + '/public'));
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

function auth(req, res, next) {
    if (req.session && req.session.userId)
        return next();
    else
        return res.sendStatus(401);
}

app.post('/register', async (req, res) => {
    let user = await models.User.findOne({username: req.fields.username}).lean();
    if (user)
        return res.statusCode(400).send("taken");
    let rTok = await models.RegisterToken.findOne({_id: req.fields.token});
    if (!rTok)
        return res.statusCode(400).send("invalid");

    let hashed = await bcrypt.hash(req.fields.password, saltRounds);
    let newUser = {
        username: req.fields.username,
        password: hashed
    };

    if (await models.User.count() === 0)
        newUser.admin = true;

    let userobj = new models.User(newUser, true);
    await userobj.save();
    await rTok.remove();
    res.send("registered");
});

app.post('/login', async (req, res) => {
    let user = await models.User.findOne({username: req.fields.username}).lean();
    if (user && await bcrypt.compare(req.fields.password, user.password)) {
        req.session.userId = user._id;
        res.send({status: "OK"});
    }
    else {
        res.sendStatus(401);
    }
});

app.post('/logout', auth, async (req, res) => {
    req.session.destroy();
    res.send({status: "OK"});
});

app.get('/wordlists', auth, async (req, res) => {
    fs.readdir(__dirname + "/public/wordlists", (err, lists) => {
        if (err)
            return res.sendStatus(404);
        lists = lists.map(l => l.replace(".txt", ""));
        res.send(lists);
    });
});

app.post('/credential', auth, async (req, res) => {
    let category = await models.Category.findOne({_id: req.fields.category_id}).lean();
    if (category.owner !== req.session.userId)
        return res.sendStatus(401);

    let credential = new models.Credential(req.fields, true);
    await credential.save();
    res.send(credential);
});

app.delete('/credential', auth, async (req, res) => {
    let existing = await models.Credential.findOne({_id: req.fields._id});
    let category = await models.Category.findOne({_id: existing.category_id}).lean();
    if (category.owner !== req.session.userId)
        return res.sendStatus(401);

    let deleted = existing.remove();
    console.log("delete", deleted);
    res.send(deleted);
});

app.put('/credential', auth, async (req, res) => {
    try {
        console.log("put", req.fields._id);
        let existing = await models.Credential.findOne({_id: req.fields._id}).lean();
        let category = await models.Category.findOne({_id: existing.category_id}).lean();

        if (category.owner !== req.session.userId)
            return res.sendStatus(401);

        let saved = await models.Credential.findOneAndUpdate({_id: req.fields._id}, req.fields, {new: true}).lean();
        console.log(saved);
        res.send(saved);
    }
    catch (error) {
        console.log(error);
    }

});

app.get('/categories', auth, async (req, res) => {
    let categories = await models.Category.find({owner: req.session.userId}).lean();
    for (let i = 0; i < categories.length; i++) {
        let category = categories[i];
        category.credentials = await models.Credential.find({category_id: category._id}).lean();
        delete category.owner;
    }
    res.send(categories);
});

app.post('/category', auth, async (req, res) => {
    let category = new models.Category(req.fields, true);
    category.owner = req.session.userId;
    await category.save();
    res.send(category);
});

app.delete('/category', auth, async (req, res) => {
    let deletedCat = await models.Category.deleteOne({_id: req.fields._id, owner: req.session.userId});
    if (deletedCat) await models.Credential.remove({category_id: req.fields._id});
    res.send({status: "OK"});
});

app.put('/category', auth, async (req, res) => {
    let saved = await models.Category.findOneAndUpdate({_id: req.fields._id, owner: req.session.userId}, req.fields, {new: true}).lean();
    res.send(saved);
});

init.init(app);

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
app.use(express.static(__dirname + "/public"));
app.use(formidable());
app.use(session({
    secret: "Charlie's engle",
    resave: false,
    saveUninitialized: false,
    cookie: {
        maxAge: 604800000, // 7 days in milliseconds
        sameSite: "strict"
    }
}));

function auth(req, res, next) {
    if (req.session && req.session.userId)
        return next();
    else
        return res.sendStatus(401);
}

async function getUserData(userId) {
    let categories = await models.Category.find({owner: userId}).lean();
    for (let i = 0; i < categories.length; i++) {
        let category = categories[i];
        category.credentials = await models.Credential.find({category_id: category._id}).lean();
        delete category.owner;
    }
    return categories;
}

const readFile = (path, opts = 'utf8') =>
    new Promise((res, rej) => {
        fs.readFile(path, opts, (err, data) => {
            if (err) rej(err);
            else res(data);
        })
    });


app.post("/login", async (req, res) => {
    try {
        let user = await models.User.findOne({username: req.fields.username}).lean();
        if (user && await bcrypt.compare(req.fields.password, user.password)) {
            req.session.userId = user._id;
            req.session.admin = user.admin;
            res.json({status: "OK"});
        }
        else {
            res.sendStatus(401);
        }
    }
    catch (err) {
        console.log(err);
        res.sendStatus(400);
    }
});

app.post("/logout", auth, async (req, res) => {
    req.session.destroy();
    res.json({status: "OK"});
});

app.post("/register", async (req, res) => {
    try {
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
        res.sendStatus(201);
    }
    catch (err) {
        console.log(err);
        res.sendStatus(400);
    }
});


app.get("/wordlists", auth, async (req, res) => {
    fs.readdir(__dirname + "/public/wordlists", (err, lists) => {
        if (err)
            return res.sendStatus(404);
        lists = lists.map(l => l.replace(".txt", ""));
        res.json(lists);
    });
});

app.get("/user", auth, async (req, res) => {
    try {
        let user = await models.User.findOne({_id: req.session.userId}).lean();
        delete user.password;
        res.json(user);
    }
    catch (err) {
        console.log(err);
        res.sendStatus(400);
    }
});


app.post("/credential", auth, async (req, res) => {
    try {
        let category = await models.Category.findOne({_id: req.fields.category_id}).lean();
        if (category.owner !== req.session.userId)
            return res.sendStatus(401);

        let credential = new models.Credential(req.fields, true);
        await credential.save();
        res.json(credential);
    }
    catch (err) {
        console.log(err);
        res.sendStatus(400);
    }
});

app.put("/credential", auth, async (req, res) => {
    try {
        console.log("put", req.fields._id);
        let existing = await models.Credential.findOne({_id: req.fields._id}).lean();
        let category = await models.Category.findOne({_id: existing.category_id}).lean();

        if (category.owner !== req.session.userId)
            return res.sendStatus(401);

        let saved = await models.Credential.findOneAndUpdate({_id: req.fields._id}, req.fields, {new: true}).lean();
        console.log(saved);
        res.json(saved);
    }
    catch (error) {
        console.log(error);
    }

});

app.delete("/credential", auth, async (req, res) => {
    try {
        let existing = await models.Credential.findOne({_id: req.fields._id});
        let category = await models.Category.findOne({_id: existing.category_id, owner: req.session.userId}).lean();
        if (!category)
            return res.sendStatus(401);
        await existing.remove();
        res.sendStatus(200);
    }
    catch (err) {
        console.log(err);
        res.sendStatus(400);
    }
});


app.get("/categories", auth, async (req, res) => {
    try {
        let categories = await getUserData(req.session.userId);
        res.json(categories);
    }
    catch (err) {
        console.log(err);
        res.sendStatus(400);
    }
});

app.post("/category", auth, async (req, res) => {
    try {
        let category = new models.Category(req.fields, true);
        category.owner = req.session.userId;
        await category.save();
        res.json(category);
    }
    catch (err) {
        console.log(err);
        res.sendStatus(400);
    }
});

app.put("/category", auth, async (req, res) => {
    try {
        let saved = await models.Category.findOneAndUpdate({_id: req.fields._id, owner: req.session.userId}, req.fields, {new: true}).lean();
        res.json(saved);
    }
    catch (err) {
        console.log(err);
        res.sendStatus(400);
    }
});

app.delete("/category", auth, async (req, res) => {
    try {
        let deletedCat = await models.Category.deleteOne({_id: req.fields._id, owner: req.session.userId});
        if (deletedCat) await models.Credential.remove({category_id: req.fields._id});
        res.sendStatus(200);
    }
    catch (err) {
        console.log(err);
        res.sendStatus(400);
    }
});


app.get("/registertoken", auth, async (req, res) => {
    try {
        if (!req.session.admin) return res.sendStatus(401);
        let token = new models.RegisterToken({created: new Date()});
        res.json(token);
    }
    catch (err) {
        console.log(err);
        res.sendStatus(400);
    }
});

app.post("/registertoken", auth, async (req, res) => {
    try {
        if (!req.session.admin) return res.sendStatus(401);
        let token = new models.RegisterToken(req.fields, true);
        await token.save();
        res.sendStatus(200);
    }
    catch (err) {
        console.log(err);
        res.sendStatus(400);
    }
});


app.get("/export", auth, async (req, res) => {
    try {
        let categories = await getUserData(req.session.userId);
        res.setHeader("Content-disposition", `attachment; filename=mypass-backup-${new Date().toLocaleString()}.json`);
        res.json(categories);
    }
    catch (err) {
        console.log(err);
        res.sendStatus(400);
    }
});

app.post("/import", auth, async (req, res) => {
    try {
        let json = await readFile(req.files.file.path);
        let categoryBackup = JSON.parse(json);
        for (const category of categoryBackup) {
            console.log("creds", category.credentials);
            let notExisting = [];
            for (let cr of category.credentials) {
                let found = await models.Credential.count({_id: cr._id});
                if (found === 0) notExisting.push(cr);
            }
            console.log("new", notExisting);
            await models.Credential.insertMany(notExisting);
            delete category.credentials;
            category.owner = req.session.userId;
            console.log("creds", category.credentials);
            await models.Category.insert(category);
        }
        fs.unlink(req.files.file.path);
        res.sendStatus(200);
    }
    catch (err) {
        console.log(err);
        res.sendStatus(400);
    }
});

init.init(app);

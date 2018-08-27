"use strict";

console.log("Starting MyPass...");

import fs from 'fs';
import express from 'express';
import session from 'express-session';
import formidable from 'express-formidable';
import csurf from 'csurf';
import bcryptjs from 'bcryptjs';

import {User, Credential, Category, RegisterToken} from './models';
import init from './init';
import config from './config.json';

const app = express();

app.use(express.static(__dirname + "../../frontend/dist")); // TODO remove when done testing
app.use(formidable());
app.use(session({
    secret: config.secret,
    resave: false,
    saveUninitialized: false,
    cookie: {
        maxAge: config.sessionLengthInMinutes * 60000, // minutes to milliseconds
        sameSite: "strict"
    }
}));
app.use(csurf());

function auth(req, res, next) {
    if (req.session && req.session.userId) return next();
    else return res.sendStatus(401);
}

async function getUserData(userId) {
    const categories = await Category.find({owner: userId});
    return categories.map(async category => {
        return {
            name: category.name,
            credentials: await Credential.find({category_id: category._id, owner: userId}).map(credential => {
                return {
                    location: credential.location,
                    description: credential.description,
                    username: credential.username,
                    password: credential.password
                };
            })

        }
    });
}

const readFile = (path, opts = 'utf8') => {
    return new Promise((res, rej) => {
        fs.readFile(path, opts, (err, data) => {
            if (err) rej(err);
            else res(data);
        })
    });
};


app.post("/login", async (req, res) => {
    try {
        const user = await User.findOne({username: req.fields.username});
        if (user && await bcryptjs.compare(req.fields.password, user.password)) {
            req.session.userId = user._id;
            req.session.admin = user.admin;
            res.json({status: "OK"});
        }
        else {
            res.sendStatus(401);
        }
    }
    catch (err) {
        console.log("login error", err);
        res.sendStatus(400);
    }
});

app.post("/logout", auth, async (req, res) => {
    req.session.destroy();
    res.json({status: "OK"});
});

app.post("/register", async (req, res) => {
    try {
        const user = await User.findOne({username: req.fields.username});
        if (user) {
            return res.statusCode(400).send("taken");
        }
        const rTok = await RegisterToken.findOne({_id: req.fields.token});
        if (!rTok || !rTok.isValid()) {
            return res.statusCode(400).send("invalid");
        }

        const timeDiff = Math.abs(new Date().getTime() - rTok.created);
        const days = Math.ceil(timeDiff / (1000 * 3600 * 24));
        if (days > config.registerTokenMaxAgeInDays) {
            await rTok.remove();
            return res.statusCode(400).send("invalid");
        }

        const hashed = await bcryptjs.hash(req.fields.password, config.saltRounds);
        const newUser = {
            username: req.fields.username,
            password: hashed
        };
        if (await User.count() === 0) {
            newUser.admin = true;
        }
        const userobj = User.create(newUser);
        await userobj.save();
        await rTok.remove();
        res.sendStatus(201);
    }
    catch (err) {
        console.log("register error", err);
        res.sendStatus(400);
    }
});


app.get("/wordlists", auth, async (req, res) => {
    fs.readdir(`${__dirname}/public/assets/wordlist`, (err, lists) => {
        if (err) {
            return res.sendStatus(404);
        }
        lists = lists.map(l => l.replace(".txt", ""));
        res.json(lists);
    });
});

app.get("/user", auth, async (req, res) => {
    try {
        const user = await User.findOne({_id: req.session.userId});
        delete user.password;
        res.json(user);
    }
    catch (err) {
        console.log("user error", err);
        res.sendStatus(400);
    }
});


app.post("/credential", auth, async (req, res) => {
    try {
        let category = await Category.findOne({_id: req.fields.category_id, owner: req.session.userId});
        if (!category) {
            return res.sendStatus(400);
        }

        const credential = {
            category_id: req.fields.category_id,
            owner: req.session.userId,
            location: req.fields.location,
            description: req.fields.description,
            username: req.fields.username,
            password: req.fields.password
        };

        let model = Credential.create(credential);
        await model.save();

        res.json(credential);
    }
    catch (err) {
        console.log("post credential error", err);
        res.sendStatus(400);
    }
});

app.put("/credential", auth, async (req, res) => {
    try {
        let existing = await Credential.count({_id: req.fields._id, owner: req.session.userId});
        if (existing !== 1) {
            return res.sendStatus(404);
        }

        let category = await Category.count({_id: req.fields.category_id, owner: req.session.userId});
        if (category !== 1) {
            return res.sendStatus(400);
        }

        const updates = {
            category_id: req.fields.category_id,
            location: req.fields.location,
            description: req.fields.description,
            username: req.fields.username,
            password: req.fields.password
        };

        await Credential.update({_id: req.fields._id}, updates);

        res.json({status: "OK"});
    }
    catch (err) {
        console.log("put credential error", err);
        res.sendStatus(400);
    }

});

app.delete("/credential", auth, async (req, res) => {
    try {
        let existing = await Credential.findOne({_id: req.fields._id, owner: req.session.userId});
        if (!existing) {
            res.sendStatus(404);
        }
        await existing.remove();
        res.json({status: "OK"});
    }
    catch (err) {
        console.log("delete credential error", err);
        res.sendStatus(400);
    }
});


app.get("/categories", auth, async (req, res) => {
    try {
        const categories = await getUserData(req.session.userId);
        res.json(categories);
    }
    catch (err) {
        console.log("get categories error", err);
        res.sendStatus(400);
    }
});

app.post("/category", auth, async (req, res) => {
    try {
        const category = {
            owner: req.session.userId,
            name: req.fields.name
        };

        let model = Category.create(category);
        await model.save();

        res.json(category);
    }
    catch (err) {
        console.log("post category error", err);
        res.sendStatus(400);
    }
});

app.put("/category", auth, async (req, res) => {
    try {
        const updates = {
            name: req.fields.name
        };
        await Category.update({_id: req.fields._id, owner: req.session.userId}, updates);

        res.json({status: "OK"});
    }
    catch (err) {
        console.log("put category error", err);
        res.sendStatus(400);
    }
});

app.delete("/category", auth, async (req, res) => {
    try {
        if (!deletedCat) {
            return res.sendStatus(404);
        }

        // Maybe don't even allow deleting category if it contains credentials, since this can be catastrophic.'
        // Otherwise, at least make the Yes button red and require typing the category name in ALL CAPS first.
        await Credential.remove({category_id: req.fields._id, owner: req.session.userId});
        await Category.remove({_id: req.fields._id, owner: req.session.userId});

        res.json({status: "OK"});
    }
    catch (err) {
        console.log("delete category error", err);
        res.sendStatus(400);
    }
});


app.get("/registertoken", auth, async (req, res) => {
    try {
        if (!req.session.admin) {
            return res.sendStatus(401);
        }

        let token = RegisterToken.create({created: new Date()});

        await token.save();

        res.json({_id: token._id, created: token.created});
    }
    catch (err) {
        console.log("get register token error", err);
        res.sendStatus(400);
    }
});


app.get("/export", auth, async (req, res) => {
    try {
        const categories = await getUserData(req.session.userId);
        const formattedDate = new Date().toISOString().substring(0, 19).replace(/:/g, ".");

        res.setHeader("Content-Disposition", `attachment; filename=mypass-backup-${formattedDate}.json`);
        res.json(categories);
    }
    catch (err) {
        console.log("export error", err);
        res.sendStatus(400);
    }
});

app.post("/import", auth, async (req, res) => {
    try {
        const json = await readFile(req.files.file.path);
        const categoryBackup = JSON.parse(json);

        const newCats = [];
        const newCreds = [];

        for (const category of categoryBackup) {
            for (let credential of category.credentials) {
                let found = await Credential.count({_id: credential._id});
                if (found === 0) {
                    credential.owner = req.session.userId;
                    newCreds.push(Credential.create(credential));
                }
            }
            delete category.credentials;
            category.owner = req.session.user;

            let found = await Category.count({_id: category._id});
            if (found === 0) {
                newCats.push(Category.create(category));
            }
        }

        await Promise.all(newCats.map(c => c.save()));
        await Promise.all(newCreds.map(c => c.save()));

        fs.unlink(req.files.file.path, (err) => {
            console.log(err, "deleted")
        });

        res.json({status: "OK"});
    }
    catch
        (err) {
        console.log("import error", err);
        res.sendStatus(400);
    }
});

init(app);

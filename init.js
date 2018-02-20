"use strict";

const mongoose = require("mongoose");
const models = require("./models");
const fs = require("fs");
const DEFAULT = {
    port: 3000,
    mongoConnectionString: "mongodb://localhost/mypass"
};

let config;

process.setMaxListeners(Infinity);
process.on('exit', () => console.log("Quitting..."));

async function checkFirstStart() {
    if (await models.User.count() !== 0) {
        return;
    }

    let token;
    try {
        token = await models.RegisterToken.findOne();
    }
    catch (err) {
        token = new models.RegisterToken({created: new Date()});
        await token.save();
    }
    console.log(`No users were detected in the database.\nVisit localhost:${config.port}/register?token=${token._id}`);
}

function init(app) {
    fs.readFile(__dirname + '/config.json', async (err, data) => {
        if (err) {
            config = DEFAULT;
        }
        else {
            try {
                config = JSON.parse(data);
            }
            catch (err) {
                config = DEFAULT;
            }
        }
        try {
            await mongoose.connect(config.mongoConnectionString);
        }
        catch (err) {
            console.log("Could not connect to MongoDB on: " + config.mongoConnectionString);
            process.exit();
        }
        try {
            await app.listen(config.port);
            console.log("Server listening on port " + config.port);
        }
        catch (err) {
            console.log("Unable to listen on port: " + config.port);
            process.exit();
        }

        checkFirstStart();
    });
}

module.exports = {
    init
};

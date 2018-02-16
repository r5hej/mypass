"use strict";

const mongoose = require("mongoose");
const models = require("./models");
const fs = require("fs");
const DEFAULT = {
    port: 3000,
    mongoConnectionString: "mongodb://localhost/mypass"
};

let config;

async function connection() {
    if (await models.User.count() !== 0) {
        return;
    }

    let token = new models.RegisterToken({created: new Date()});
    await token.save();
    console.log(`No users were detected in the database.\nVisit localhost:${config.port}/register/?token=${token._id}`);
}

function init(app) {
    fs.readFile(__dirname + '/config.json', (err, data) => {
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

        mongoose.connect(config.mongoConnectionString);
        app.listen(config.port, () => console.log("Server started on port " + config.port));
        connection();
    });
}

module.exports = {
    init
};

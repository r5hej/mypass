"use strict";

import { User, RegisterToken } from './models';
import config from './config.json';

import { connect } from 'camo';
import events from 'events';
events.EventEmitter.defaultMaxListeners = Infinity; // To "fix" MaxListenersExceededWarning
process.setMaxListeners(Infinity);
process.on('exit', () => console.log("Closing MyPass server..."));

async function checkFirstStart() {
    if (await User.count() !== 0) {
        return;
    }

    let token = await RegisterToken.findOne();
    if (!token) {
        token = RegisterToken.create({created: new Date()});
    }
    else {
        token.created = new Date();
    }
    await token.save();
    console.log(`No users were detected in the database.\nVisit localhost:${config.port}/register?token=${token._id}`);
}

export default async function init(app) {
    if (!config.secret) {
        console.log("Please configure a secret");
        process.exit();
    }

    try {
        await connect(config.connectionString);
    }
    catch (err) {
        console.log(`Could not connect to database using: ${config.connectionString}`);
        process.exit();
    }

    try {
        await app.listen(config.port);
        console.log(`Server listening on port ${config.port}`);
    }
    catch (err) {
        console.log(`Unable to listen on port: ${config.port}`);
        process.exit();
    }

    await checkFirstStart();
}


"use strict";

import {Document} from 'camo';

export class User extends Document {
    constructor() {
        super();
        this.username = {type: String, required: true, index: {unique: true}};
        this.password = {type: String, required: true};
        this.admin = {type: Boolean, default: false};
    }
}


export class Credential extends Document {
    constructor() {
        super();
        this.category_id = {type: String, required: true};
        this.owner = {type: String, required: true};
        this.location = {type: String, required: true};
        this.description = String;
        this.username = String;
        this.password = {type: String, required: true};
    }
}


export class Category extends Document {
    constructor() {
        super();
        this.owner = {type: String, required: true};
        this.name = {type: String, required: true};
    }

    static collectionName() {
        return 'Categories';
    }
}


export class RegisterToken extends Document {
    constructor() {
        super();
        this.created = {type: Date, required: true}
    }
}

"use strict";

const templateFile = "templates.html";

let currentUser;
let buckets;
let templates;
let wrapper = document.getElementById("wrapper");


// Functions to render template content
function renderLogin() {
    let wrapper = document.getElementById('wrapper');

    wrapper.innerHTML = templates.login.render();
    document.getElementById('login-form').addEventListener('submit', authUser);
}

function renderManager() {
    let wrapper = document.getElementById('wrapper');

    wrapper.innerHTML = templates.manager.render();
    fetchBuckets(renderBucketLst);
    renderTable();


    // JsT.get(templateFile, function(templates) {
    //     wrapper.innerHTML = templates.manager.render();
    //
    //     fetchBuckets(renderBucketLst);
    //     // renderBucketLst();
    //     renderTable();
    // });
}

function renderTable() {
    let table = document.getElementById('bucket-tbody');

    JsT.get(templateFile, function(templates) {
        table.innerHTML += templates.bucketTableRow.render({
            location: "facebook",
            description: "noget med facebook",
            password: "123456"
        });
    });
}

function renderBucketLst() {
    let lst = document.getElementById('bucket-lst');

    JsT.get(templateFile, function(templates) {
        lst.innerHTML = "";
        buckets.forEach(item => {
            lst.innerHTML += templates.bucketItem.render({
                bucketName: item.name
            });
        });
    });
}

// Login
function authUser(ev) {
    ev.preventDefault();
    let form = new FormData(this);
    postForm("/login", form, user => {
        console.log("logged in:", user);
        renderManager();
    }, (err, resp) => {
        console.log("could not log in:", resp);
    });
}

// buckets
function fetchBuckets(callback) {
    ajaxPost('/bucket', JSON.stringify({"username": currentUser.username}), data => {
        buckets = JSON.parse(data);
        if (callback !== undefined) { callback(); }
    }, data => {
        console.log("couldn't get bucket");
    });
}

function addBucket(username, bucketname, passwords) {
    let bucket = new Object();
    bucket.username = username;
    bucket.name = bucketname;
    bucket.passwords = passwords;

    ajaxPost('/bucket/add', JSON.stringify(bucket), data => {
        console.log("bucket added");
        // if (json.response === 200) {
        buckets.push(bucket);
        // }
    }, data => {
        console.log("couldn't add bucket");
    });
}

function postForm(url, form, success, error) {
    let xhr = new XMLHttpRequest();
    xhr.open('POST', url, true);

    xhr.onload = function (e) {
        if (xhr.readyState === 4 && xhr.status === 200)
            success(xhr.responseText);
        else
            error(e, xhr.statusText);
    };
    xhr.onerror = function (e) {
        error(e, xhr.statusText);
    };
    xhr.send(form);
}

// Wrapper functions
function ajaxPost(url, data, success, error) {
    let xhr = new XMLHttpRequest();
    xhr.onreadystatechange = function () {
        if (xhr.readyState === 4) {
            if (xhr.status === 200) {
                success(JSON.parse(xhr.responseText));
            } else {
                error(xhr.responseText);
            }
        }
    };
    xhr.open('POST', url, true);
    xhr.setRequestHeader("Content-type", "application/json");
    xhr.send(data);
    return xhr;
}

function ajaxGet(url, success, error) {
    let xhr = new XMLHttpRequest();
    xhr.onreadystatechange = function () {
        if (xhr.readyState === 4) {
            if (xhr.status === 200) {
                success(xhr.responseText);
            } else {
                error(xhr.responseText);
            }
        }
    };
    xhr.open('GET', url, true);
    return xhr;
}

JsT.get(templateFile, tmpl => {
    templates = tmpl;
    renderLogin();
});


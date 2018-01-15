"use strict";

const templateFile = "templates.html";
window.onload = renderLogin();

let currentUser;
let buckets;

// Functions to render template content
function renderLogin() {
    let wrapper = document.getElementById('wrapper');

    JsT.get(templateFile, function(templates) {
        wrapper.innerHTML = templates.login.render();
        document.getElementById('login-btn').addEventListener('click', authUser);
    });
}

function renderManager() {
    let wrapper = document.getElementById('wrapper');

    JsT.get(templateFile, function(templates) {
        wrapper.innerHTML = templates.manager.render();

        fetchBuckets(renderBucketLst);
        // renderBucketLst();
        renderTable();
    });
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
function authUser() {
    let user = new Object();
    user.username = document.getElementsByName('username')[0].value;
    user.password = document.getElementsByName('password')[0].value;

    ajaxPost('/login/user', JSON.stringify(user), data => {
        let json = JSON.parse(data);
        if (json.response === 200) {
            currentUser = json.user;
            renderManager();
        } else {
            console.log("login failed");
        }
    }, function(data) {
        console.log("Couldn't connect to server");
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



// Wrapper functions
function ajaxPost(url, data, success, error) {
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

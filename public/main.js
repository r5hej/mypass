"use strict";

const templateFile = "templates.html";
let currentUser;
let buckets;
let templates;
let wrapper = document.getElementById("wrapper");


// Functions to render template content
function renderLogin() {
    wrapper.innerHTML = templates.login.render();
    document.getElementById('login-form').addEventListener('submit', authUser);
}

function renderManager() {
    wrapper.innerHTML = templates.manager.render();
    renderBucketLst();
    document.getElementById('bucket-lst').on('click', 'li', renderTable);
}

function renderTable(e) {
    let table = document.getElementById('bucket-tbody');
    let bucket = buckets.find(item => item.name === e.target.innerText);

    for (let i = 0; i < bucket.passwords.length; i++) {
        table.innerHTML += templates.bucketTableRow.render({
            location: passwords[i].location,
            description: passwords[i].description,
            password: passwords[i].password
        });
    }
}

function renderBucketLst() {
    let lst = document.getElementById('bucket-lst');

    lst.innerHTML = "";
    buckets.forEach(item => {
        lst.innerHTML += templates.bucketItem.render({
            bucketName: item.name
        });
    });
}

// Login
function authUser(ev) {
    ev.preventDefault();
    let form = new FormData(this);
    postForm("/login", form, resp => {
        currentUser = {
            username: form.get('username'),
            password : form.get('password')
        };

        console.log("logged in:", currentUser.username);
        buckets = JSON.parse(resp);
        renderManager();
    }, (err, resp) => {
        console.log("could not log in:", resp);
    });
}

// buckets
function updateBucket() {
    let bucket = buckets.find(item => item.owner === "r5hej");
    console.log(bucket.name);
    ajaxPost('/bucket/update', JSON.stringify(bucket), data => {
        console.log(data);
        if (data === "success")
            console.log("bucket updated");
        else
            console.log("bucket update failed");
    }, data => {
            console.log("bucket update failed");
    });
}

function addBucket(bucketname) {
    if (!bucketname) {
        console.log("No given name for new bucket");
        return;
    }

    let bucket = {
        owner: currentUser.username,
        name: bucketname,
        passwords: []
    };

    ajaxPost('/bucket/add', JSON.stringify(bucket), data => {
        if (data === "success") {
            console.log("bucket added");
            buckets.push(bucket);
        }
        else
            console.log("bucket was not added");
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


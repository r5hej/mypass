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
        document.getElementById('add-bucket-btn').addEventListener('click', () => {
            showModal("bucket");
        });
        document.getElementById('add-password-btn').addEventListener('click', () => {
            showModal("passwords");
        });
    });
}

function renderTable(bucket) {
    let table = document.getElementById('bucket-tbody');
    let bucketArray = [];
    !Array.isArray(bucket.passwords) ? bucketArray.push(bucket.passwords) : bucketArray = bucket.passwords;

    JsT.get(templateFile, function(templates) {
        table.innerHTML = "";
        for (let i = 0; i < bucketArray.length; i++) {
            table.innerHTML += templates.bucketTableRow.render({
                location: bucketArray[i].location,
                description: bucketArray[i].description,
                password: bucketArray[i].password
            });
        }
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
        lst.addEventListener('click', clickedBucketLstChild);
    });
}

function clickedBucketLstChild(e) {
    if (e.target === e.currentTarget) {
        return;
    }
    let bucket = buckets.find(item => item.name === e.target.innerText);
    renderTable(bucket);
    e.stopPropagation();
}

// Modal functions
function showModal(btn) {
    let modal = document.getElementById(btn === "bucket" ? "add-bucket-modal" : "add-password-modal");
    modal.style.opacity = "1";
    modal.style.pointerEvents = "auto";

    // close button
    // modal.getElementsByClassName('modal-close close')[0].addEventListener('click', () => closeModal(btn));
    // // add button
    // modal.getElementsByClassName('btn-add')[0].addEventListener('click', () => addBtnHandler(btn));
}

function addBtnHandler(btn) {
    if (btn === "bucket") {
        addBucket((res, bucket) => {
            // if (res.response === 200) {
            buckets.push(bucket);
            closeModal(btn);
            renderBucketLst();
            // }
        });
    } else {
        addPassword(() => {
            closeModal(btn);
            renderTable();
        });
    }
}

function closeModal(btn) {
    let modal = document.getElementById(btn === "bucket" ? "add-bucket-modal" : "add-password-modal");
    modal.style.opacity = "0";
    modal.style.pointerEvents = "none";
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

function addBucket(callback) {
    let bucket = new Object();
    bucket.username = currentUser.username;
    bucket.name = document.querySelector('input[name=new-bucket-name]').value;
    bucket.passwords = [];

    ajaxPost('/bucket/add', JSON.stringify(bucket), data => {
        callback(data, bucket);
    }, data => {
        console.log("couldn't add bucket");
    });
}


// password
function addPassword(callback) {

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

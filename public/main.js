"use strict";

const templateFile = "templates.html";
let currentUser;
let buckets;
let templates;
let activeBucket;
let wrapper = document.getElementById("wrapper");


// Functions to render template content
function renderLogin() {
    wrapper.innerHTML = templates.login.render();
    document.getElementById('login-form').addEventListener('submit', authUser);
}

function renderManager() {
    wrapper.innerHTML = templates.manager.render();
    renderBucketLst();
    document.getElementById('bucket-lst').on('click', 'li', ev => {
        let bucket = buckets.find(item => item.name === ev.target.innerText);

        let lst = document.getElementById('bucket-lst');
        if (activeBucket) {
            for (let node of lst.childNodes) {
                if (node.innerText === activeBucket.name) {
                    node.removeAttribute('style');
                }
            }
        }

        activeBucket = bucket;

        for (let node of lst.childNodes) {
            if (node.innerText === activeBucket.name) {
                node.style.backgroundColor = "#14b208";
                node.style.color = "white";
            }
        }

        renderTable();
    });
    document.getElementById('add-bucket-btn').addEventListener('click', addBucketModal);
    document.getElementById('update-bucket-btn').addEventListener('click', updateBucket);
    document.getElementById('add-password-btn').addEventListener('click', addPasswordModal);
}

function renderTable() {
    let table = document.getElementById('bucket-tbody');
    table.innerHTML = "";

    for (let i = 0; i < activeBucket.passwords.length; i++) {
        table.innerHTML += templates.bucketTableRow.render({
            location: activeBucket.passwords[i].location,
            description: activeBucket.passwords[i].description,
            password: activeBucket.passwords[i].password
        });
    }
    table.on('click', 'i.material-icons', renderDropdown);
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

function renderDropdown(ev) {
    // let lst = ev.target.parentNode;
    let lst = ev.target;
    lst.innerHTML = templates.dropdown.render();

    document.getElementById('dropdown-content').classList.toggle("show-dropdown");
    document.getElementById('dropdown-lst').on('click', 'li', ev => {
        if (ev.target.innerText === "Delete") {
            deleteRowFromBucketModal();
        }
    });
}

// Modals
function addBucketModal() {
    ModalsJs.open(templates.bucketModal.render());
    let form = document.getElementById('add-bucket-form');
    form.addEventListener('submit', ev => {
        ev.preventDefault();
        let formData = new FormData(form);
        addBucket(formData.get('bucketName'));
    });
}

function addPasswordModal() {
    ModalsJs.open(templates.passwordModal.render());
    let form = document.getElementById('add-password-form');
    form.addEventListener('submit', ev => {
        ev.preventDefault();
        let formData = new FormData(form);
        addPassword(formData);
    });
}

function deleteRowFromBucketModal() {
    ModalsJs.open(templates.deleteRowModal.render());
    document.getElementById('deleteConfirmationForm').on('click', 'input', ev => {
        ev.preventDefault();
        if (ev.target.value === "Yes")
            deleteRowFromBucket();
        ModalsJs.close();
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
    ajaxPost('/bucket/update', JSON.stringify(activeBucket), data => {
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
        console.log("No name given for new bucket");
        return;
    }

    let bucket = {
        owner: currentUser.username,
        name: bucketname,
        passwords: []
    };

    ModalsJs.close();
    ajaxPost('/bucket/add', JSON.stringify(bucket), data => {
        if (data !== "failed") {
            console.log("bucket added");
            bucket._id = data;
            buckets.push(bucket);
            renderBucketLst();
        }
        else
            console.log("bucket was not added");
    }, data => {
        console.log("couldn't add bucket");
    });
}

function addPassword(form) {
    let newPwd = {
        location: form.get('location'),
        description: form.get('description'),
        password: form.get('password')
    };

    let bucket = buckets.find(item => item._id === activeBucket._id);
    bucket.passwords.push(newPwd);
    ModalsJs.close();
    renderTable();
}

function deleteRowFromBucket() {
    console.log("delete row");
}

// Wrapper functions
function postForm(url, form, success, error) {
    let xhr = new XMLHttpRequest();
    xhr.open('POST', url, true);

    xhr.onload = function(e) {
        if (xhr.readyState === 4 && xhr.status === 200)
            success(xhr.responseText);
        else
            error(e, xhr.statusText);
    };
    xhr.onerror = function(e) {
        error(e, xhr.statusText);
    };
    xhr.send(form);
}

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

// needs fixing
window.onclick = function(event) {
    if (!event.target.matches('i.material-icons')) {

        let dropdowns = document.getElementsByClassName("dropdown-content");
        for (let i = 0; i < dropdowns.length; i++) {
            let openDropdown = dropdowns[i];
            if (openDropdown.classList.contains('show-dropdown')) {
                openDropdown.classList.remove('show-dropdown');
            }
        }
    }
};

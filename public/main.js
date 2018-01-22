"use strict";

const templateFile = "templates.html";
const hiddenPwd = "\u2022\u2022\u2022\u2022\u2022\u2022\u2022\u2022";
// const hiddenString = "&bull;&bull;&bull;&bull;&bull;&bull;&bull;&bull";
let currentUser;
let buckets;
let templates;
let activeBucket;
let isActiveDropdown = false;
let isEditableContent = false;
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
            password: hiddenPwd
            // password: activeBucket.passwords[i].password
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

function renderDropdown(ev1) {
    let dropdown = ev1.target.parentNode;
    isActiveDropdown = true;
    dropdown.getElementsByClassName('dropdown')[0].innerHTML = templates.dropdown.render();

    let row = ev1.target.parentNode.parentNode;
    document.getElementById('dropdown-lst').on('click', 'li', ev => {
        switch (ev.target.innerText) {
            case "Delete":
                deleteRowFromBucketModal(row);
                break;

            case "Edit":
                makeRowEditable(row);
                break;

            case "Show/Hide":
                toggleShowHide(row);
                break;
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

function deleteRowFromBucketModal(row) {
    ModalsJs.open(templates.deleteRowModal.render());
    document.getElementById('deleteConfirmationForm').on('click', 'input', ev => {
        ev.preventDefault();
        if (ev.target.value === "Yes")
            deleteRowFromBucket(row);
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

function toggleShowHide(row) {
    let pwdField = row.querySelector('td[name=password]');

    if (!(pwdField.innerText === hiddenPwd)) {
        pwdField.innerText = hiddenPwd;
        return;
    }

    let location = row.querySelector('td[name=location]').innerText;
    let password = activeBucket.passwords.find(item => item.location === location).password;

    pwdField.innerText = password;
}


function updateActiveBucketRow(row) {
    let location = row.querySelector('td[name=location]').innerText;
    let desc = row.querySelector('td[name=description]').innerText;
    let password = row.querySelector('td[name=password]').innerText;
    let index = activeBucket.passwords.findIndex(item => item.location === location);

    activeBucket.passwords[index].location = location;
    activeBucket.passwords[index].description = desc;
    activeBucket.passwords[index].password = password;
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

function deleteRowFromBucket(row) {
    let location = row.querySelector('td[name=location]').innerText;
    let bucketIndex;
    activeBucket.passwords.findIndex((item, index) => {
        if (item.location === location)
            bucketIndex = index;
    });

    activeBucket.passwords.splice(bucketIndex, 1);
    renderTable();
}

function makeRowEditable(row) {
    row.querySelector('td[name=location]').setAttribute('contenteditable', 'true');
    row.querySelector('td[name=description]').setAttribute('contenteditable', 'true');
    row.querySelector('td[name=password]').setAttribute('contenteditable', 'true');
    isEditableContent = true;
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
window.onclick = function(ev) {
    if (isActiveDropdown) {
        if (!ev.target.matches('i.material-icons')) {
            let dropdowns = document.getElementsByClassName("dropdown");
            for (let i = 0; i < dropdowns.length; i++) {
                dropdowns[i].innerHTML = "";
            }
            isActiveDropdown = false;
        }
    }
    if (isEditableContent) {
        if (!ev.target.matches('td[contenteditable=true]') && !ev.target.matches('ul#dropdown-lst > li')) {
            let cells = document.querySelectorAll('td[contenteditable=true]');
            for (let i = 0; i < cells.length; i++) {
                cells[i].removeAttribute('contenteditable');
            }
            isEditableContent = false;
            updateActiveBucketRow(cells[0].parentNode);
        }
    }
};

"use strict";

const templateFile = "templates.html";
const hiddenPwd = "\u2022\u2022\u2022\u2022\u2022\u2022\u2022\u2022";
let currentUser = {};
let buckets;
let templates;
let activeBucket;
let isActiveDropdown = false;
let isEditableContent = false;
let wrapper = document.getElementById("wrapper");

let dropdown = false;
// Functions to render template content
function renderLogin() {
    wrapper.innerHTML = templates.login.render();
    document.getElementById('login-form').addEventListener('submit', login);
}

function renderManager() {
    wrapper.innerHTML = templates.manager.render();
    renderBucketLst();
    document.getElementById('add-bucket-btn').addEventListener('click', addBucketModal);
    document.getElementById('update-bucket-btn').addEventListener('click', updateBucket);
    document.getElementById('add-password-btn').addEventListener('click', addPasswordModal);
    let table = document.getElementById('bucket-tbody');

    dropdown = document.getElementById("bucket-dropdown");
    dropdown.on("click", "li", ev => {
        let id = dropdown.item;
        switch (ev.target.dataset.action){
            case "name":
                console.log(id, "edit name");
                break;
            case "delete":
                console.log(id, "delete");
                break;
        }
        dropdown.classList.remove("active");
        dropdown.item = null;
    });
    document.body.addEventListener("click", () => {
        if (dropdown.item !== null){
            dropdown.classList.remove("active");
            dropdown.item = null
        }
    });
    table.on('click', 'i.more-button', renderDropdown);
    table.on('click', 'i.show-password', toggleShowHide);
}


function renderTable() {
    let table = document.getElementById('bucket-tbody');

    let html = "";
    for (let i = 0; i < activeBucket.passwords.length; i++) {
        html += templates.bucketTableRow.render({
            location: activeBucket.passwords[i].location,
            description: activeBucket.passwords[i].description,
            password: hiddenPwd
            // password: activeBucket.passwords[i].password
        });
    }
    table.innerHTML = html;
}

function renderBucketLst() {
    let lst = document.getElementById('bucket-lst');
    let html = "";
    buckets.forEach(bucket => {
        html += templates.bucketItem.render(bucket);
    });
    lst.innerHTML = html;

    lst.on('click', 'li', ev => {
        let element = ev.target;
        let bucket = buckets.find(item => item._id === element.dataset.id);
        console.log(bucket);

        if (activeBucket)
            lst.querySelector(".selected").classList.remove("selected");

        activeBucket = bucket;
        element.classList.add("selected");

        renderTable();
    });
    lst.on("contextmenu", "li", ev => {
        ev.preventDefault();
        dropdown.style.top = ev.pageY + "px";
        dropdown.style.left = ev.pageX + "px";
        dropdown.classList.add("active");
        dropdown.item = ev.target.dataset.id;
    });
}

function renderDropdown(ev1) {
    let dropdown = ev1.target.parentNode;
    isActiveDropdown = true;
    dropdown.getElementsByClassName('dropdown')[0].innerHTML = templates.dropdown.render();

    let row = ev1.target.parentNode.parentNode;
    document.getElementById('dropdown-lst').on('click', 'li', ev => {
        switch (ev.target.innerText) {
            case "delete_forever":
                deleteRowFromBucketModal(row);
                break;

            case "mode_edit":
                makeRowEditable(row);
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
        addPassword(new FormData(form));
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

let enc, dec;
function login(ev) {
    ev.preventDefault();
    let form = new FormData(this);
    let pwd = form.get("password");
    enc = s => s;
    dec = s => s;
    currentUser.username = form.get("username");
    currentUser.password = form.get("password");
    postForm("/login", form, () => {
        loadBuckets();
    }, () => {
        this.reset();
    });
}

function logout() {
    ajaxPost("/logout", null, () => {
        buckets = [];
        activeBucket = null;
        currentUser = {};
        renderLogin();
    }, () => console.log("could not log out"))

}

// buckets
function loadBuckets() {
    ajaxGet("/buckets", resp => {
        buckets = JSON.parse(resp);
        renderManager();
    }, () => {
        renderLogin();
    });
}

function updateBucket() {
    ajaxPost('/buckets/update', JSON.stringify(activeBucket), data => {
        console.log("bucket updated");
    }, data => {
            console.log("bucket update failed");
    });
}
function addBucket(bucketname)  {
    let bucket = {
        name: bucketname,
        passwords: []
    };

    ModalsJs.close();
    ajaxPost('/buckets/add', JSON.stringify(bucket), data => {
        bucket = JSON.parse(data);
        buckets.push(bucket);
        renderBucketLst();
    }, () => {
        console.log("couldn't add bucket");
    });
}

function toggleShowHide(ev) {
    let row = ev.target.parentNode.parentNode;
    let pwdField = row.querySelector('span[name=password]');

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


function addPassword(form) {
    let newPwd = {
        location: form.get('location'),
        description: form.get('description'),
        password: form.get('password')
    };

    activeBucket.passwords.push(newPwd);
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

function createElement(tag, cls, html) {
    let element = document.createElement(tag);
    element.className = cls;
    if (html) element.innerHTML = html;
    return element;
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
    xhr.open("GET", url, true);
    xhr.onload = function (e) {
        if (xhr.readyState === 4) {
            if (xhr.status === 200) {
                success(xhr.responseText);
            } else {
                error(xhr.statusText);
            }
        }
    };
    xhr.onerror = function (e) {
        error(xhr.statusText);
    };
    xhr.send(null);
}

JsT.get(templateFile, tmpl => {
    templates = tmpl;
    loadBuckets();
});

// needs fixing
window.onclick = function(ev) {
    if (isActiveDropdown) {
        if (!ev.target.matches('i.more-button')) {
            let dropdowns = document.getElementsByClassName('dropdown');
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

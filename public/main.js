"use strict";

const templateFile = "templates.html";
const hiddenPwd = "\u2022\u2022\u2022\u2022\u2022\u2022\u2022\u2022";
let currentUser = {};
let buckets, bucketMap;
let templates;
let activeBucket;
let isActiveDropdown = false;
let isEditableContent = false;
let wrapper = document.getElementById("wrapper");

let dropdown, passwordDropdown;
// Functions to render template content
function renderLogin() {
    wrapper.innerHTML = templates.login.render();
    document.getElementById('login-form').addEventListener('submit', login);
}
let mainTable, bucketList;
function renderManager() {
    wrapper.innerHTML = templates.manager.render();
    document.getElementById('add-bucket-btn').addEventListener('click', addBucketModal);
    document.getElementById('update-bucket-btn').addEventListener('click', updateBucket);
    document.getElementById('add-password-btn').addEventListener('click', addPasswordModal);

    bucketList = document.getElementById('bucket-lst');
    bucketList.on('click', 'li', ev => {
        let element = ev.target;
        if (activeBucket)
            bucketList.querySelector(".selected").classList.remove("selected");
        activeBucket = bucketMap.get(element.dataset.id);
        element.classList.add("selected");
        renderTable();
    });
    bucketList.on("contextmenu", "li", ev => {
        ev.preventDefault();
        dropdown.style.top = ev.pageY + "px";
        dropdown.style.left = ev.pageX + "px";
        dropdown.classList.add("active");
        dropdown.item = ev.target.dataset.id;
    });

    const hideDropdown = (element) => {
        element.classList.remove("active");
        element.item = undefined
    };

    dropdown = document.getElementById("bucket-dropdown");
    dropdown.on("click", "li", ev => {
        let id = dropdown.item;
        let form = new FormData();
        form.set("_id", id);
        switch (ev.target.dataset.action){
            case "name":
                console.log(id, "edit name");
                break;
            case "delete":
                postForm("buckets/delete", form, () => {
                    ev.target.parentNode.removeChild(ev.target);
                    bucketMap.delete(id);
                });
                break;
        }
        hideDropdown(dropdown);
    });

    passwordDropdown = document.getElementById("password-dropdown");
    passwordDropdown.on("click", "li", ev => {
        let id = dropdown.item;
        switch (ev.target.dataset.action){
            case "edit":
                console.log(id, "edit row");
                break;
            case "delete":
                console.log(id, "delete");
                break;
        }
        hideDropdown(passwordDropdown);
    });



    document.body.addEventListener("click", ev => {
        if (dropdown.item !== undefined)
            hideDropdown(dropdown);
        if (passwordDropdown.item !== undefined)
            hideDropdown(passwordDropdown);
    });

    mainTable = document.getElementById('bucket-tbody');
    mainTable.on("click", ".more-button", ev => {
        event.stopPropagation();
        passwordDropdown.style.top = ev.pageY + "px";
        passwordDropdown.style.left = ev.pageX + "px";
        passwordDropdown.classList.add("active");
        passwordDropdown.item = "dawdasdadawdas";
    });
    // mainTable.on('click', 'i.more-button', renderDropdown);
    mainTable.on('click', 'i.show-password', toggleShowHide);
    renderBucketLst();
}


function renderTable() {
    let html = "";
    for (let i = 0; i < activeBucket.credentials.length; i++) {
        html += templates.bucketTableRow.render({
            location: activeBucket.credentials[i].location,
            description: activeBucket.credentials[i].description,
            password: hiddenPwd
        });
    }
    mainTable.innerHTML = html;
}

function renderBucketLst() {
    let html = "";
    bucketMap.forEach(kvp => {
        html += templates.bucketItem.render(kvp);
    });
    bucketList.innerHTML = html;
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
    ModalsJs.open(templates.passwordModal.render(), {warning: true});
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
        bucketMap = new Map();
        for (let i = 0; i < buckets.length; i++) {
            bucketMap.set(buckets[i]._id, buckets[i]);
        }
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
        credentials: []
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
    let password = activeBucket.credentials.find(item => item.location === location).password;
    pwdField.innerText = password;
}


function updateActiveBucketRow(row) {
    let location = row.querySelector('td[name=location]').innerText;
    let desc = row.querySelector('td[name=description]').innerText;
    let password = row.querySelector('td[name=password]').innerText;
    let index = activeBucket.credentials.findIndex(item => item.location === location);

    activeBucket.credentials[index].location = location;
    activeBucket.credentials[index].description = desc;
    activeBucket.credentials[index].password = password;
}


function addPassword(form) {
    let newPwd = {
        location: form.get('location'),
        description: form.get('description'),
        password: form.get('password')
    };

    activeBucket.credentials.push(newPwd);
    ModalsJs.close(true);
    renderTable();
}

function deleteRowFromBucket(row) {
    let location = row.querySelector('td[name=location]').innerText;
    let bucketIndex;
    activeBucket.credentials.findIndex((item, index) => {
        if (item.location === location)
            bucketIndex = index;
    });

    activeBucket.credentials.splice(bucketIndex, 1);
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
// window.onclick = function(ev) {
//     if (isActiveDropdown) {
//         if (!ev.target.matches('i.more-button')) {
//             let dropdowns = document.getElementsByClassName('dropdown');
//             for (let i = 0; i < dropdowns.length; i++) {
//                 dropdowns[i].innerHTML = "";
//             }
//             isActiveDropdown = false;
//         }
//     }
//     if (isEditableContent) {
//         if (!ev.target.matches('td[contenteditable=true]') && !ev.target.matches('ul#dropdown-lst > li')) {
//             let cells = document.querySelectorAll('td[contenteditable=true]');
//             for (let i = 0; i < cells.length; i++) {
//                 cells[i].removeAttribute('contenteditable');
//             }
//             isEditableContent = false;
//             updateActiveBucketRow(cells[0].parentNode);
//         }
//     }
// };

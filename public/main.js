"use strict";

const templateFile = "templates.html";
const hiddenPwd = "\u2022\u2022\u2022\u2022\u2022\u2022\u2022\u2022";
let currentUser = {};
let buckets, bucketMap;
let templates;
let activeCategory;
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
    document.getElementById('add-bucket-btn').addEventListener('click', addCategoryModal);
    document.getElementById('update-bucket-btn').addEventListener('click', updateBucket);
    document.getElementById('add-password-btn').addEventListener('click', addPasswordModal);

    bucketList = document.getElementById('bucket-lst');
    bucketList.on('click', 'li', ev => {
        let element = ev.target;
        if (activeCategory)
            bucketList.querySelector(".selected").classList.remove("selected");
        activeCategory = bucketMap.get(element.dataset.id);
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
        switch (ev.target.dataset.action){
            case "edit":
                makeRowEditable(passwordDropdown.item);
                break;
            case "delete":
                deleteRowFromBucketModal(passwordDropdown.item);
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
        passwordDropdown.item = ev.target.parentNode.parentNode;
    });
    // mainTable.on('click', 'i.more-button', renderDropdown);
    mainTable.on('click', 'i.show-password', toggleShowHide);
    renderCategories();
}


function renderTable() {
    let html = "";
    for (let i = 0; i < activeCategory.credentials.length; i++) {
        html += templates.bucketTableRow.render({
            location: activeCategory.credentials[i].location,
            description: activeCategory.credentials[i].description,
            password: hiddenPwd
        });
    }
    mainTable.innerHTML = html;
}

function renderCategories() {
    let html = "";
    for (let category in map){
        html += templates.bucketItem.render(map[category]);
    }
    bucketList.innerHTML = html;
}

// Modals
function addCategoryModal() {
    ModalsJs.open(templates.bucketModal.render());
    let form = document.getElementById('add-bucket-form');
    form.addEventListener('submit', ev => {
        ev.preventDefault();
        let formData = new FormData(form);
        ModalsJs.close();
        postForm('/category', formData, data => {
            data = JSON.parse(data);
            map[data._id] = data;
            renderCategories();
        }, () => {
            console.log("couldn't add category");
        });
        renderTable();
    });
}

function addPasswordModal() {
    ModalsJs.open(templates.passwordModal.render(), {warning: true});
    let form = document.getElementById('add-password-form');
    let cId = activeCategory._id;
    form.addEventListener('submit', ev => {
        ev.preventDefault();
        let formData = new FormData(form);
        ModalsJs.close();
        postForm('/credential', formData, data => {
            data = JSON.parse(data);
            map[cId][data._id] = data;
            renderCategories();
        }, () => {
            console.log("couldn't add credential");
        });
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
        activeCategory = null;
        currentUser = {};
        renderLogin();
    }, () => console.log("could not log out"))

}

// buckets
let categories, map;

function loadBuckets() {
    ajaxGet("/categories", resp => {
        categories = JSON.parse(resp);
        map = Object.create(null);
        for (let i = 0; i < categories.length; i++){
            let category = categories[i];
            let tCreds = Object.create(null);
            for (let j = 0; j < category.credentials.length; j++){
                let credential = category.credentials[j];
                tCreds[credential._id] = credential;
            }

            map[category._id] = {
                category,
                map: tCreds
            };
        }
        console.log(categories);
        console.log(map);
        renderManager();
    }, () => {
        renderLogin();
    });
}

function updateBucket() {
    ajaxPost('/buckets/update', JSON.stringify(activeCategory), data => {
        console.log("bucket updated");
    }, data => {
            console.log("bucket update failed");
    });
}

function toggleShowHide(ev) {
    let row = ev.target.parentNode.parentNode;
    let pwdField = row.querySelector('td[name=password]');

    if (!(pwdField.innerText === hiddenPwd)) {
        pwdField.innerText = hiddenPwd;
        return;
    }

    let location = row.querySelector('td[name=location]').innerText;
    let password = activeCategory.credentials.find(item => item.location === location).password;
    pwdField.innerText = password;
}


function updateActiveBucketRow(row) {
    let location = row.querySelector('td[name=location]').innerText;
    let desc = row.querySelector('td[name=description]').innerText;
    let password = row.querySelector('td[name=password]').innerText;
    let index = activeCategory.credentials.findIndex(item => item.location === location);

    activeCategory.credentials[index].location = location;
    activeCategory.credentials[index].description = desc;
    activeCategory.credentials[index].password = password;
}



function deleteRowFromBucket(row) {
    let location = row.querySelector('td[name=location]').innerText;
    let bucketIndex = activeCategory.credentials.findIndex(item => item.location === location);
    activeCategory.credentials.splice(bucketIndex, 1);
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
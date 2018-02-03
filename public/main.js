"use strict";

const hiddenPwd = "\u2022\u2022\u2022\u2022\u2022\u2022\u2022\u2022";
let templates;
let activeCategory;

let categories, map;
let wrapper = document.getElementById("wrapper");
let categoryDropdown, credentialDropdown;
let mainTable, categoryList;

function renderLogin() {
    wrapper.innerHTML = templates.login.render();
    document.getElementById('login-form').addEventListener('submit', login);
}
function renderManager() {
    wrapper.innerHTML = templates.manager.render();
    document.getElementById('add-bucket-btn').addEventListener('click', () => categoryModal());
    document.getElementById('logout-btn').addEventListener('click', () => logout());
    document.getElementById('add-password-btn').addEventListener('click', () => credentialModal());

    categoryList = document.getElementById('bucket-lst');
    categoryList.on('click', 'li', ev => {
        let element = ev.target;
        if (activeCategory)
            categoryList.querySelector(".selected").classList.remove("selected");
        activeCategory = map.get(element.dataset.id).category;
        element.classList.add("selected");
        renderTable();
    });
    categoryList.on("contextmenu", "li", ev => {
        ev.preventDefault();
        categoryDropdown.style.top = ev.pageY + "px";
        categoryDropdown.style.left = ev.pageX + "px";
        categoryDropdown.classList.add("active");
        categoryDropdown.item = ev.target.dataset.id;
    });

    const hideDropdown = (element) => {
        element.classList.remove("active");
        element.item = undefined
    };

    categoryDropdown = document.getElementById("bucket-dropdown");
    categoryDropdown.on("click", "li", ev => {
        let id = categoryDropdown.item;
        let form = new FormData();
        form.set("_id", id);
        switch (ev.target.dataset.action){
            case "name":
                categoryModal(map.get(id).category);
                break;
            case "delete":
                sendForm('DELETE', "category", form, () => {
                    // ev.target.parentNode.removeChild(ev.target);
                    // bucketMap.delete(id);
                });
                break;
        }
        hideDropdown(categoryDropdown);
    });

    credentialDropdown = document.getElementById("password-dropdown");
    credentialDropdown.on("click", "li", ev => {
        let catWrap = map.get(activeCategory._id);
        let catMap = catWrap.map;
        let credId = credentialDropdown.item.dataset.id;
        switch (ev.target.dataset.action){
            case "edit":
                credentialModal(catMap.get(credId));
                break;
            case "delete":
                deleteCredentialModal(credentialDropdown.item, catWrap, );
                break;
        }
        hideDropdown(credentialDropdown);
    });

    document.body.addEventListener("click", ev => {
        if (categoryDropdown.item !== undefined)
            hideDropdown(categoryDropdown);
        if (credentialDropdown.item !== undefined)
            hideDropdown(credentialDropdown);
    });

    mainTable = document.getElementById('bucket-tbody');
    mainTable.on("click", ".more-button", ev => {
        event.stopPropagation();
        credentialDropdown.style.top = ev.pageY + "px";
        credentialDropdown.style.left = ev.pageX + "px";
        credentialDropdown.classList.add("active");
        credentialDropdown.item = ev.target.parentNode.parentNode;
    });
    mainTable.on('click', 'i.show-password', togglePassword);
    renderCategories();
}
function renderTable() {
    if (!activeCategory)
        return;
    let html = "";
    for (let i = 0; i < activeCategory.credentials.length; i++) {
        html += templates.bucketTableRow.render({
            credential: activeCategory.credentials[i],
            password: hiddenPwd
        });
    }
    mainTable.innerHTML = html;
}
function renderCategories() {
    let html = "";
    categories.forEach(c => html += templates.bucketItem.render(c));
    categoryList.innerHTML = html;
}

// Modals
function categoryModal(category) {
    ModalsJs.open(templates.categoryModal.render({
        title: !!category ? "Edit category" : "Add a new category",
        category: category
    }));
    let form = document.getElementById('add-bucket-form');
    form.addEventListener('submit', ev => {
        ev.preventDefault();
        let formData = new FormData(form);
        if (category){ // update existing
            formData.set("_id", category._id);
            sendForm('PUT', "/category", formData, () => {
                map.get(category._id).category.name = formData.get("name");
                ModalsJs.close();
                renderCategories();
            });
        }
        else { // add new
            sendForm('POST', '/category', formData, data => {
                data.credentials = [];
                categories.push(data);
                map.set(data._id, {
                    category: data,
                    map: new Map()
                });
                ModalsJs.close();
                renderCategories();
            });
        }
    });
}
function credentialModal(creds) {
    if (!activeCategory)
        return;
    ModalsJs.open(templates.credentialModal.render({
        title: !!creds ? "Edit credential" : "Add a new credential",
        credential: creds
    }), { warning: true });
    let form = document.getElementById('add-password-form');
    let catId = activeCategory._id;
    form.addEventListener('submit', ev => {
        ev.preventDefault();
        let formData = new FormData(form);
        formData.set("category_id", catId);
        if (creds){
            sendForm('PUT', '/credential', formData, data => {
                Object.assign(map.get(catId).map.get(data._id), data);
                ModalsJs.close(true);
                renderTable();
            });
        }
        else {
            sendForm('POST', '/credential', formData, data => {
                let categoryWrapper = map.get(catId);
                categoryWrapper.category.credentials.push(data);
                categoryWrapper.map.set(data._id, data);
                ModalsJs.close(true);
                renderTable();
            });
        }
    });
}
function deleteCredentialModal(row, catId, credId) {
    ModalsJs.open(templates.deleteRowModal.render());
    document.getElementById('deleteConfirmationForm').on('click', 'input', ev => {
        ev.preventDefault();
        if (ev.target.value === "Yes")
            deleteRowFromBucket(row);
        ModalsJs.close();
    });
}

function login(ev) {
    ev.preventDefault();
    let form = new FormData(this);
    let pwd = form.get("password");
    currentUser.username = form.get("username");
    currentUser.password = form.get("password");
    sendForm('POST', "/login", form, () => {
        loadBuckets();
    }, () => {
        this.reset();
    });
}
function logout() {
    postJson("/logout", null, () => {
        categories = [];
        map = null;
        activeCategory = null;
        renderLogin();
    });

}

function loadBuckets() {
    getJson("/categories", cats => {
        categories = cats;
        map = new Map();
        for (let i = 0; i < cats.length; i++){
            let category = cats[i];
            let tCreds = new Map();
            for (let j = 0; j < category.credentials.length; j++){
                let credential = category.credentials[j];
                tCreds.set(credential._id, credential);
            }
            map.set(category._id, {
                category,
                map: tCreds
            });
        }
        renderManager();
    }, () => {
        renderLogin();
    });
}

function togglePassword(ev) {
    let row = ev.target.parentNode.parentNode;
    let pwdField = row.querySelector('td[name=password]');
    let credId = row.dataset.id;

    if (!(pwdField.innerText === hiddenPwd))
        pwdField.innerText = hiddenPwd;
    else
        pwdField.innerText = map.get(activeCategory._id).map.get(credId).password;
}

function deleteRowFromBucket(row) {
    let location = row.querySelector('td[name=location]').innerText;
    let bucketIndex = activeCategory.credentials.findIndex(item => item.location === location);
    activeCategory.credentials.splice(bucketIndex, 1);
    renderTable();
}

function sendForm(method, url, form, success, error) {
    let xhr = new XMLHttpRequest();
    xhr.open(method, url, true);

    xhr.onload = function(e) {
        if (xhr.readyState === 4 && xhr.status === 200)
            success(JSON.parse(xhr.responseText));
        else
            error(e, xhr.statusText);
    };
    xhr.onerror = function(e) {
        error(e, xhr.statusText);
    };
    xhr.send(form);
}
function postJson(url, data, success, error) {
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
function getJson(url, success, error) {
    let xhr = new XMLHttpRequest();
    xhr.open("GET", url, true);
    xhr.onload = function (e) {
        if (xhr.readyState === 4) {
            if (xhr.status === 200) {
                success(JSON.parse(xhr.responseText));
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

JsT.get("templates.html", tmpl => {
    templates = tmpl;
    loadBuckets();
});
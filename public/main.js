"use strict";
const hiddenPwd = "\u2022\u2022\u2022\u2022\u2022\u2022\u2022\u2022";
let templates, activeCategory;
let wordlistsLangs, wordlists = Object.create(null);
let categories, map, crypto;
let wrapper = document.getElementById("wrapper");
let categoryDropdown, credentialDropdown;
let mainTable, categoryList;

function renderLogin() {
    wrapper.innerHTML = templates.login.render();
    document.getElementById('login-form').addEventListener('submit', login);
}
function renderManager() {
    wrapper.innerHTML = templates.manager.render();
    document.getElementById('add-category-btn').addEventListener('click', () => categoryModal());
    document.getElementById('logout-btn').addEventListener('click', () => logout());
    document.getElementById('add-credential-btn').addEventListener('click', () => credentialModal());
    document.getElementById('generate-pass-btn').addEventListener('click', () => passgenModal());

    const showDropdown = (element, ev, item) => {
        ev.preventDefault();
        element.style.top = ev.pageY + "px";
        element.style.left = ev.pageX + "px";
        element.classList.add("active");
        element.item = item;
    };
    const hideDropdown = element => {
        element.classList.remove("active");
        element.item = undefined
    };

    categoryList = document.getElementById('category-lst');
    categoryList.on('click', 'li', ev => {
        let element = ev.target;
        if (activeCategory) {
            categoryList.querySelector(".selected").classList.remove("selected");
        }
        activeCategory = map.get(element.dataset.id).category;
        element.classList.add("selected");
        renderTable();
    });
    categoryList.on("contextmenu", "li", ev => showDropdown(categoryDropdown, ev, ev.target.dataset.id));

    categoryDropdown = document.getElementById("category-dropdown");
    categoryDropdown.on("click", "li", ev => {
        let id = categoryDropdown.item;
        let form = new FormData();
        form.set("_id", id);
        switch (ev.target.dataset.action){
            case "name":
                categoryModal(map.get(id).category);
                break;
            case "delete":
                deleteCategory(form);
                break;
        }
        hideDropdown(categoryDropdown);
    });

    credentialDropdown = document.getElementById("credential-dropdown");
    credentialDropdown.on("click", "li", ev => {
        let catWrap = map.get(activeCategory._id);
        let catMap = catWrap.map;
        let credId = credentialDropdown.item.dataset.id;
        switch (ev.target.dataset.action){
            case "edit":
                credentialModal(catMap.get(credId));
                break;
            case "delete":
                deleteCredential(credentialDropdown.item);
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

    let copyTarget = document.createElement("textarea");
    mainTable = document.getElementById('credentials-tbody');
    mainTable.on("click", ".more-button", ev => showDropdown(credentialDropdown, ev, ev.target.parentNode.parentNode));
    mainTable.on("click", "td[data-type=password]", ev => {
        ev.stopPropagation();
        let credId = ev.target.parentNode.dataset.id;
        let password = crypto.dec(map.get(activeCategory._id).map.get(credId).password);
        wrapper.appendChild(copyTarget);
        copyTarget.textContent = password;
        copyTarget.select();
        document.execCommand("copy");
        copyTarget.textContent = "";
        wrapper.removeChild(copyTarget);
    });
    mainTable.on("click", "td[data-type=username]", ev => {
        ev.stopPropagation();
        let credId = ev.target.parentNode.dataset.id;
        wrapper.appendChild(copyTarget);
        copyTarget.textContent = map.get(activeCategory._id).map.get(credId).username;
        copyTarget.select();
        document.execCommand("copy");
        copyTarget.textContent = "";
        wrapper.removeChild(copyTarget);
    });
    mainTable.on('click', 'i.show-password', togglePassword);
    renderCategories();
}
function renderTable() {
    if (!activeCategory)
        return;
    let html = "";
    for (let i = 0; i < activeCategory.credentials.length; i++) {
        html += templates.credentialTableRow.render({
            credential: activeCategory.credentials[i],
            password: hiddenPwd
        });
    }
    mainTable.innerHTML = html;
}
function renderCategories() {
    let html = "";
    categories.forEach(c => html += templates.categoryItem.render(c));
    categoryList.innerHTML = html;

    if (!activeCategory) {
        return;
    }

    let elements = categoryList.getElementsByTagName('li');
    console.log(elements);
    for (let i = 0; i < elements.length; i++) {
        if (elements[i].dataset && elements[i].dataset.id === activeCategory._id) {
            elements[i].classList.add("selected");
            break;
        }
    }
}

// Modals
function passgenModal() {
    sendRequest('GET', "/wordlists").then(languages => {
        ModalsJs.open(templates.passgenModal.render({ languages }));
        let form = document.getElementById("passgen-form");
        let phraseGen = document.getElementById("passphrase-gen");
        let wordGen = document.getElementById("password-gen");
        form.on("change", "input[type=radio]", ev => {
            if (ev.target.checked && ev.target.value === "phrase"){
                phraseGen.classList.add("active");
                wordGen.classList.remove("active");
            }
            else if (ev.target.checked && ev.target.value === "word"){
                phraseGen.classList.remove("active");
                wordGen.classList.add("active");
            }
        });
    })
}
function categoryModal(category) {
    ModalsJs.open(templates.categoryModal.render({
        title: !!category ? "Edit category" : "Add a new category",
        category: category
    }));
    let form = document.getElementById('add-category-form');
    form.addEventListener('submit', ev => {
        ev.preventDefault();
        let formData = new FormData(form);
        let name = formData.get("name");
        encryptFormFields(formData, ["name"]);
        if (category) { // update existing
            formData.set("_id", category._id);
            sendRequest('PUT', "/category", formData).then(() => {
                map.get(category._id).category.name = name;
                ModalsJs.close();
                renderCategories();
            });
        }
        else { // add new
            sendRequest('POST', '/category', formData).then(data => {
                data.credentials = [];
                data.name = name;
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
        credential: !!creds ? {
            username: creds.username,
            password: crypto.dec(creds.password),
            location: creds.location,
            description: creds.description
        } : undefined
    }), { warning: true });
    let catId = activeCategory._id;
    let form = document.getElementById('add-credential-form');
    form.addEventListener('submit', ev => {
        ev.preventDefault();
        let formData = new FormData(form);
        encryptFormFields(formData, ["username", "password", "location", "description"]);
        formData.set("category_id", catId);
        if (creds){
            sendRequest('PUT', '/credential', formData).then(data => {
                decryptFields(data, ["username", "location", "description"]);
                Object.assign(creds, data);
                ModalsJs.close(true);
                renderTable();
            });
        }
        else {
            sendRequest('POST', '/credential', formData).then(data => {
                decryptFields(data, ["username", "location", "description"]);
                let categoryWrapper = map.get(catId);
                categoryWrapper.category.credentials.push(data);
                categoryWrapper.map.set(data._id, data);
                ModalsJs.close(true);
                renderTable();
            });
        }
    });
}

function deleteCredential(row) {
    confirmationModal(() => {
        let form = new FormData();
        form.set("_id", row.dataset.id);
        sendRequest('DELETE', "credential", form).then(() => {
            let index = activeCategory.credentials.findIndex(item => item._id === row.dataset.id);
            activeCategory.credentials.splice(index, 1);
            renderTable();
        });
    });
}

function deleteCategory(form) {
    confirmationModal(() => {
        sendRequest('DELETE', "category").then(form, () => {
            let index = categories.findIndex(item => item._id === form.get('_id'));
            categories.splice(index, 1);
            renderCategories();
        });
    });
}

function confirmationModal(callback) {
    ModalsJs.open(templates.deleteConfirmationModal.render());
    document.getElementById('deleteConfirmationForm').on('click', 'input', ev => {
        ev.preventDefault();
        if (ev.target.value === "Yes")
            callback();
        ModalsJs.close();
    });
}

function decryptionPasswordModal(title, cb) {
    ModalsJs.open(templates.decryptPasswordModal.render({ title }));
    let form = document.getElementById("decrypt-password-form");
    form.addEventListener("submit", ev => {
        ev.preventDefault();
        cb(form.querySelector("input[type=password]").value);
        ModalsJs.close();
    })
}

function login(ev) {
    ev.preventDefault();
    let form = new FormData(this);
    sendRequest('POST', "/login", form).then(() => {
        loadBuckets();
    }).catch(() => {
        this.reset();
    });
}
function logout() {
    sendRequest('POST', "/logout").then(() => {
        categories = [];
        map = undefined;
        activeCategory = undefined;
        crypto = undefined;
        renderLogin();
    }).catch(() => { console.log("logout failed"); });
}

function loadBuckets() {
    sendRequest('GET', "/categories").then(cats => {
        let title = cats ? "Create encryption password" : "Enter decryption password";
        decryptionPasswordModal(title, password => {
            crypto = createCryptoFuncs(password);
            categories = cats;
            map = new Map();
            for (let i = 0; i < cats.length; i++) {
                let category = cats[i];
                decryptFields(category, ["name"]);
                let tCreds = new Map();
                for (let j = 0; j < category.credentials.length; j++) {
                    let credential = category.credentials[j];
                    decryptFields(credential, ["username", "location", "description"]);
                    tCreds.set(credential._id, credential);
                }
                map.set(category._id, {
                    category,
                    map: tCreds
                });
            }
            renderManager();
        });
    }).catch(renderLogin);
}


function encryptFormFields(form, fields) {
    for (let i = 0; i < fields.length; i++) {
        let value = crypto.enc(form.get(fields[i]));
        form.set(fields[i], value);
    }
}

function decryptFields(obj, fields) {
    for (let i = 0; i < fields.length; i++) {
        obj[fields[i]] = crypto.dec(obj[fields[i]]);
    }
}

function togglePassword(ev) {
    let row = ev.target.parentNode.parentNode;
    let pwdField = row.querySelector('td[data-type=password');
    let credId = row.dataset.id;
    if (!(pwdField.innerText === hiddenPwd)){
        pwdField.innerText = hiddenPwd;
        ev.target.innerText = "visibility";
    }
    else{
        pwdField.innerText = crypto.dec(map.get(activeCategory._id).map.get(credId).password);
        ev.target.innerText = "visibility_off";
    }
}

function getRandomNumbers(no) {
    if (false && window.crypto && window.crypto.getRandomValues) {
        return window.crypto.getRandomValues(new Uint32Array(no));
    } else {
        let arr = new Uint32Array(no);
        for (let i = 0; i < no; i++)
            arr[i] = Math.floor(Math.random() * 10242028);
        return arr;
    }
}
function capitalize(str) {
    return str.charAt(0).toUpperCase() + str.substr(1);
}
function generatePassphrase(language, wordNumber, capitalize, separators) {
    return new Promise((accept, reject) => {
        getLanguage(language).then(wordlist => {
            capitalize = capitalize || false;
            separators = separators || [" "];
            wordNumber = wordNumber || 6;
            let i = 0;
            let randomNumbers = getRandomNumbers(wordNumber * 3);

            let str = "";
            for (let j = 0; j < wordNumber; j++) {
                let word = wordlist[randomNumbers[i++] % wordlist.length];
                if (capitalize && randomNumbers[i++] % 2 === 0)
                    word = capitalize(word);
                str += word.trim();
                if (j === wordNumber - 1) break;
                str += separators[randomNumbers[i++] % separators.length];
            }
            accept(str.trim());
        });
    });
}
function getLanguage(language) {
    return new Promise((accept, reject) => {
        if (wordlists[language] === undefined){
            sendRequest('GET', `/wordlists/${language.toLowerCase()}.txt`, null, false).then(wl => {
                wl = wl.split('\n');
                wordlists[language] = wl;
                accept(wordlists[language]);
            }).catch(err => reject(err));
        }
        else{
            accept(wordlists[language]);
        }
    });
}

function createCryptoFuncs(password) {
    let hash = sha256(password);
    let keyBytes = aesjs.utils.utf8.toBytes(hash).slice(0, 32); // 32 bytes for AES256
    return {
        enc: plainStr => {
            let strBytes = aesjs.utils.utf8.toBytes(plainStr);
            let aesCtr = new aesjs.ModeOfOperation.ctr(keyBytes, new aesjs.Counter(5));
            let encryptedBytes = aesCtr.encrypt(strBytes);
            return aesjs.utils.hex.fromBytes(encryptedBytes);
        },
        dec: hexStr => {
            let encryptedBytes = aesjs.utils.hex.toBytes(hexStr);
            let aesCtr = new aesjs.ModeOfOperation.ctr(keyBytes, new aesjs.Counter(5));
            let decryptedBytes = aesCtr.decrypt(encryptedBytes);
            return aesjs.utils.utf8.fromBytes(decryptedBytes);
        }
    }
}
function sendRequest(method, url, data, json) {
    return new Promise((res, rej) => {
        json = json === undefined ? true : json;
        let xhr = new XMLHttpRequest();
        xhr.open(method, url, true);

        xhr.onload = e => {
            if (xhr.readyState === 4 && xhr.status === 200)
                res(json ? JSON.parse(xhr.responseText) : xhr.responseText);
            else
                rej(e, xhr.statusText);
        };
        xhr.onerror = e => rej(xhr.statusText);
        xhr.send(data);
    });
}

JsT.get("templates.html", tmpl => {
    templates = tmpl;
    templates.passgenModal.setFormatter("languages", langs => {
        return langs.reduce((acc, curr) => {
            return acc += `<option value="${curr}">${capitalize(curr)}</option>`
        }, "");
    });
    loadBuckets();
});
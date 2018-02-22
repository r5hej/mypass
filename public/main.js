"use strict";

const hiddenPwd = "\u2022\u2022\u2022\u2022\u2022\u2022\u2022\u2022";
let templates, activeCategory;
let wordlists = Object.create(null);
let categories, map, crypto;
let wrapper = document.getElementById("wrapper");
let categoryDropdown, credentialDropdown;
let mainTable, categoryList, copyTarget;


function renderLogin() {
    wrapper.innerHTML = templates.login.render();
    document.getElementById("login-form").on("submit", login);
}
function renderManager() {
    wrapper.innerHTML = templates.manager.render();
    document.getElementById("add-category-btn").on("click", () => categoryModal());
    document.getElementById("add-credential-btn").on("click", () => credentialModal());
    document.getElementById("generate-pass-btn").on("click", passgenModal);
    document.getElementById("logout-btn").on("click", logout);
    document.getElementById("backup-btn").on("click", backupModal);
    checkAdminStatus();

    const showDropdown = (element, ev, item) => {
        ev.preventDefault();
        ev.stopPropagation();
        element.style.top = ev.pageY + "px";
        element.style.left = ev.pageX + "px";
        element.classList.add("active");
        element.item = item;
    };
    const hideDropdown = element => {
        element.classList.remove("active");
        element.item = undefined
    };

    categoryList = document.getElementById("category-lst");
    categoryList.on("click", "li", ev => {
        let element = ev.target;
        if (activeCategory) {
            categoryList.querySelector(".selected").classList.remove("selected");
        }
        activeCategory = map.get(element.dataset.id).category;
        element.classList.add("selected");
        renderTable();
    });
    categoryList.on("contextmenu", "li", ev => {
        if (!ev.ctrlKey)
            showDropdown(categoryDropdown, ev, ev.target.dataset.id);
    });

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

    document.body.on("click", ev => {
        if (categoryDropdown.item !== undefined)
            hideDropdown(categoryDropdown);
        if (credentialDropdown.item !== undefined)
            hideDropdown(credentialDropdown);
    });

    copyTarget = document.createElement("textarea");
    mainTable = document.getElementById("credentials-tbody");
    mainTable.on("click", ".more-button", ev => showDropdown(credentialDropdown, ev, ev.target.parentNode.parentNode));
    mainTable.on("click", "td[data-type=password]", ev => {
        let credId = ev.target.parentNode.dataset.id;
        copy(crypto.dec(map.get(activeCategory._id).map.get(credId).password));
    });
    mainTable.on("click", "td[data-type=username]", ev => {
        let credId = ev.target.parentNode.dataset.id;
        copy(map.get(activeCategory._id).map.get(credId).username);
    });
    mainTable.on("click", "i.show-password", togglePassword);
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

    let elements = categoryList.getElementsByTagName("li");
    for (let i = 0; i < elements.length; i++) {
        if (elements[i].dataset && elements[i].dataset.id === activeCategory._id) {
            elements[i].classList.add("selected");
            break;
        }
    }
}

function checkAdminStatus() {
    sendRequest("GET", "/user").then(user => {
        if (user.admin === true) {
            let inviteButton = document.getElementById('create-register-token');
            inviteButton.style.display = "inherit";
            inviteButton.on('click', inviteModal)
        }
    });
}

// Modals

function backupModal() {
    ModalsJs.open(templates.backupModal.render());
    document.getElementById("import-form").on("submit", function (ev) {
        ev.preventDefault();
        let form = new FormData(this);
        sendRequest("POST", "/import", form).then(() => {
            renderTable();
            renderCategories();
            ModalsJs.close();
        }).catch(() => {
            console.log("NOT OK");
        });
    })
}

function inviteModal() {
    const urlFunc = id => `${window.location.protocol}//${window.location.host}/register?token=${id}`;
    sendRequest("GET", "/registertoken").then(token => {
        console.log("invite token", token);
        let modal = ModalsJs.open(templates.inviteModal.render({
            token,
            url: urlFunc(token._id)
        }));
        let form = document.getElementById("invite-form");
        form.querySelector("input[type=button]").on("click", ev => {
            sendRequest("GET", "/registertoken").then(newToken => {
                let a = document.getElementById("copy-invite-url");
                a.href = urlFunc(newToken._id);
                a.innerText = urlFunc(newToken._id);
                form.querySelector("input[type=submit]").disabled = false;
            });
        });
        modal.element.querySelector("#copy-invite-url").on("click", ev => {
            ev.preventDefault();
            copy(token._id);
        });
        form.on("submit", ev => {
            let formData = new FormData(form);
            ev.preventDefault();
            sendRequest("POST", "/registertoken", formData).then(() => {
                form.reset();
                form.querySelector("input[type=submit]").disabled = true;
            })
        })
    })
}

function passgenModal() {
    sendRequest("GET", "/wordlists").then(languages => {
        ModalsJs.open(templates.passgenModal.render({ languages }));
        let row = document.getElementById("passgen-type-row");
        let phraseGen = document.getElementById("passphrase-gen");
        let wordGen = document.getElementById("password-gen");
        let newPass = document.getElementById("new-pass");
        let genBtn = document.getElementById("new-passgen-btn");
        let active = "phrase";
        const newPassphraseFunc = () => {
            let selected = phraseGen.querySelectorAll("select option:checked");
            let langs = Array.from(selected).map((el) => el.value);
            let cap = phraseGen.querySelector("input[type=checkbox]").checked;
            let sep = phraseGen.querySelector("input[type=text]").value.split("");
            let words = parseInt(phraseGen.querySelector("input[type=number]").value);
            generatePassphrase(langs, words, cap, sep).then(pass => newPass.innerText = pass);
        };
        const newPasswordFunc = () => {
            let chars = wordGen.querySelector("textarea").value.replace(/ /g, "").split("");
            let len = parseInt(wordGen.querySelector("input").value);
            newPass.innerText = generatePassword(chars, len);
        };

        row.on("click", "div.passgen-top-row-btn", ev => {
            row.querySelector(".active").classList.remove("active");
            ev.target.classList.add("active");
            if (ev.target.dataset.type === "phrase"){
                active = "phrase";
                ev.target.classList.add("active");
                row.querySelector("div[data-type=word").classList.remove("active");
                phraseGen.classList.add("active");
                wordGen.classList.remove("active");
                newPassphraseFunc();
            }
            else if (ev.target.dataset.type === "word"){
                active = "word";
                ev.target.classList.add("active");
                row.querySelector("div[data-type=phrase").classList.remove("active");
                phraseGen.classList.remove("active");
                wordGen.classList.add("active");
                newPasswordFunc();
            }
        });
        wordGen.on("input", "textarea,input", newPasswordFunc);
        genBtn.on("click", () => {
            if (active === "phrase")
                newPassphraseFunc();
            else if (active === "word")
                newPasswordFunc();
        });

        phraseGen.on("input", "select,input[type=number],input[type=text]", newPassphraseFunc);
        phraseGen.on("change", "input[type=checkbox]", newPassphraseFunc);
        phraseGen.querySelector("select").value = [ "english" ];
        newPass.on("click", () => copy(newPass.innerText));
        newPassphraseFunc();
    });
}
function copy(text) {
    console.log(event, text);
    event.stopPropagation();
    wrapper.appendChild(copyTarget);
    copyTarget.textContent = text;
    copyTarget.select();
    document.execCommand("copy");
    copyTarget.textContent = "";
    wrapper.removeChild(copyTarget);
}

function categoryModal(category) {
    ModalsJs.open(templates.categoryModal.render({
        title: !!category ? "Edit category" : "Add a new category",
        category: category
    }));
    let form = document.getElementById("add-category-form");
    form.on("submit", ev => {
        ev.preventDefault();
        let formData = new FormData(form);
        let name = formData.get("name");
        encryptFormFields(formData, ["name"]);
        if (category) { // update existing
            formData.set("_id", category._id);
            sendRequest("PUT", "/category", formData).then(() => {
                map.get(category._id).category.name = name;
                ModalsJs.close();
                renderCategories();
            });
        }
        else { // add new
            sendRequest("POST", "/category", formData).then(data => {
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
    }));
    let catId = activeCategory._id;
    let form = document.getElementById("add-credential-form");
    form.on("submit", ev => {
        ev.preventDefault();
        let formData = new FormData(form);
        encryptFormFields(formData, ["username", "password", "location", "description"]);
        formData.set("category_id", catId);
        if (creds){
            formData.append("_id", creds._id);
            sendRequest("PUT", "/credential", formData).then(data => {
                decryptFields(data, ["username", "location", "description"]);
                Object.assign(creds, data);
                ModalsJs.close(true);
                renderTable();
            });
        }
        else {
            sendRequest("POST", "/credential", formData).then(data => {
                decryptFields(data, ["username", "location", "description"]);
                let categoryWrapper = map.get(catId);
                categoryWrapper.category.credentials.push(data);
                categoryWrapper.map.set(data._id, data);
                ModalsJs.close(true);
                renderTable();
            }).catch(err => {
                console.log(err);
            });
        }
    });
}

function deleteCredential(row) {
    ModalsJs.prompt({ title: "Delete credential?" }).then(ans => {
        if (ans) {
            let form = new FormData();
            form.set("_id", row.dataset.id);
            sendRequest("DELETE", "credential", form).then(() => {
                let index = activeCategory.credentials.findIndex(item => item._id === row.dataset.id);
                activeCategory.credentials.splice(index, 1);
                renderTable();
            });
        }
    });
}

function deleteCategory(form) {
    ModalsJs.prompt({ title: "Delete category?" }).then(ans => {
        if (ans) {
            sendRequest("DELETE", "category", form).then(() => {
                let index = categories.findIndex(item => item._id === form.get("_id"));
                categories.splice(index, 1);
                renderCategories();
            });
        }
    });
}

function decryptionPasswordModal(create, cb) {
    let template = create ? templates.createDecryptPasswordModal : templates.decryptPasswordModal;
    ModalsJs.open(template.render());
    let form = document.getElementById("decrypt-password-form");
    form.on("submit", ev => {
        ev.preventDefault();
        let data = new FormData(form);
        if (create && !(data.get("password") === data.get("password2"))) {
            form.reset();
            form.querySelector("input[name=password").focus();
            return;
        }
        cb(data.get("password"));
        ModalsJs.close();
    })
}

function login(ev) {
    ev.preventDefault();
    let form = new FormData(this);
    sendRequest("POST", "/login", form).then(() => {
        loadBuckets();
    }).catch(() => {
        this.reset();
        this.querySelector("input[name=username]").focus();
    });
}
function logout() {
    sendRequest("POST", "/logout").then(() => {
        categories = [];
        map = undefined;
        activeCategory = undefined;
        crypto = undefined;
        renderLogin();
    }).catch(() => { console.log("logout failed"); });
}

function loadBuckets() {
    sendRequest("GET", "/categories").then(cats => {
        let create = cats.length === 0;
        // let create = cats.length === 0 ? "Create encryption password" : "Enter decryption password";
        decryptionPasswordModal(create, password => {
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
        if (!form.has(fields[i])) continue;
        let value = crypto.enc(form.get(fields[i]));
        form.set(fields[i], value);
    }
}

function decryptFields(obj, fields) {
    for (let i = 0; i < fields.length; i++) {
        if (obj[fields[i]] !== undefined)
            obj[fields[i]] = crypto.dec(obj[fields[i]]);
    }
}

function togglePassword(ev) {
    let row = ev.target.parentNode.parentNode;
    let pwdField = row.querySelector("td[data-type=password");
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
function capitalizeWord(str) {
    return str.charAt(0).toUpperCase() + str.substr(1);
}
function generatePassphrase(languages, wordNumber, capitalize, separators) {
    return new Promise((accept, reject) => {
        getLanguages(languages).then(wordlist => {
            capitalize = capitalize || false;
            if (separators.length === 0) separators = [" "];
            wordNumber = wordNumber || 6;
            let i = 0;
            let randomNumbers = getRandomNumbers(wordNumber * 3);

            let str = "";
            for (let j = 0; j < wordNumber; j++) {
                let word = wordlist[randomNumbers[i++] % wordlist.length];
                if (capitalize && randomNumbers[i++] % 2 === 0)
                    word = capitalizeWord(word);
                str += word.trim();
                if (j === wordNumber - 1) break;
                str += separators[randomNumbers[i++] % separators.length];
            }
            accept(str.trim());
        });
    });
}
function getLanguages(languages) {
    return new Promise((accept, reject) => {
        let final = [], done = 0;
        for (let i = 0; i < languages.length; i++){
            let lang = languages[i];
            if (wordlists[lang] === undefined){
                sendRequest("GET", `/wordlists/${lang.toLowerCase()}.txt`, null, false).then(wl => {
                    wl = wl.split("\n");
                    wordlists[lang] = wl;
                    final = final.concat(wordlists[lang]);
                    if (done++ === languages.length - 1)
                        accept(final);
                }).catch(err => reject(err));
            }
            else{
                final = final.concat(wordlists[lang]);
                if (done++ === languages.length - 1)
                    accept(final);
            }
        }
    });
}
function generatePassword(chars, len) {
    let numbers = getRandomNumbers(len);
    let pass = "";
    for (let i = 0; i < len; i++){
        pass += chars[numbers[i] % chars.length];
    }
    return pass;
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
            return acc += `<option value="${curr}">${capitalizeWord(curr)}</option>`
        }, "");
    });
    loadBuckets();
});

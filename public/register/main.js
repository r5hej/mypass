"use strict";


let form = document.getElementById('register-form');
let status = document.getElementById('status');
form.addEventListener('submit', ev => {
    ev.preventDefault();
    let formData = new FormData(form);
    if (formData.get("password") !== formData.get("password2"))
        return status.innerText = "Passwords must match";

    sendRequest("POST", "/register", formData).then(resp => {
        window.location = window.location.origin;
    }).catch(resp => {
        if (resp === "taken")
            status.innerText = "Username is not available";
        else
            disableForm("Invalid registration token");
        form.reset();
    });
});

function getParameterByName(name) {
    name = name.replace(/[\[\]]/g, "\\$&");
    let regex = new RegExp("[?&]" + name + "(=([^&#]*)|&|#|$)"),
        results = regex.exec(window.location.href);
    if (!results) return null;
    if (!results[2]) return '';
    return decodeURIComponent(results[2].replace(/\+/g, " "));
}
function sendRequest(method, url, data) {
    return new Promise((res, rej) => {
        let xhr = new XMLHttpRequest();
        xhr.open(method, url, true);

        xhr.onload = e => {
            if (xhr.readyState === 4 && xhr.status === 200)
                res(xhr.responseText);
            else
                rej(e, xhr.statusText);
        };
        xhr.onerror = e => rej(xhr.statusText);
        xhr.send(data);
    });
}
function disableForm(warning) {
    for (let input of form.querySelectorAll("input")){
        input.disabled = true;
        input.readOnly = true;
    }
    status.innerText = warning;
}
if (!getParameterByName("token")){
    disableForm("No registration token");
}
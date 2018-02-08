"use strict";


let form = document.getElementById('register-form');
form.addEventListener('submit', ev => {
    ev.preventDefault();
    let data = new FormData(form);

    if (!(data.get('username') && data.get('password'))) {
        console.log('There is empty fields');
        return;
    }

    let xhr = new XMLHttpRequest();
    xhr.open('POST', '/register', true);
    xhr.onload = function (e) {
        if (xhr.readyState === 4 && xhr.status === 200)
            if (xhr.responseText === '200')
                window.location = window.location.origin;
            else {
                console.log('Username taken');
                form.reset();
            }
        else
            console.log('Registration failed');
    };
    xhr.onerror = function (e) {
        console.log('Registration failed');
    };
    xhr.send(data);
});

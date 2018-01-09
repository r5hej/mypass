"use strict";

window.onload = RenderLogin();

// Functions to render template content
function RenderLogin() {
    let wrapper = document.getElementById('wrapper');

    JsT.get('templates.html', function(templates) {
        wrapper.innerHTML = templates.login.render();
    });
}

function RenderManager() {
    let wrapper = document.getElementById('wrapper');

    JsT.get('templates.html', function(templates) {
        wrapper.innerHTML = templates.manager.render();

        RenderBucketLst();
        RenderTable();
    });
}

function RenderTable() {
    let table = document.getElementById('bucket-tbody');

    JsT.get('templates.html', function(templates) {
        table.innerHTML += templates.bucketTableRow.render({
            location: "facebook",
            description: "noget med facebook",
            password: "123456"
        });
    });
}

function RenderBucketLst() {
    let lst = document.getElementById('bucket-lst');

    JsT.get('templates.html', function(templates) {
        lst.innerHTML += templates.bucketItem.render({
            bucketName: "fisk"
        });
    });
}

// Login
function AuthUser() {
    let user = {"username": "r5hej", "password": "password"};
    // AjaxPost('/login/user', user, function(data) {
    //    console.log(data);
    // });
    $.ajax({
        url: '/login/user',
        type: 'POST',
        data: user,
        success: function (response) {
            // user = JSON.parse(JSON.stringify(response));
            // window.location.href = "citizenadmin.html";
            console.log("request send");
        },
        error: function (response) {
            console.log("Login attempt failed");
        }
    });
}


function AjaxPost(url, data, success) {
    let params = typeof data == 'string' ? data : Object.keys(data).map(
        function(k){ return encodeURIComponent(k) + '=' + encodeURIComponent(data[k]) }
    ).join('&');
    let xhr = window.XMLHttpRequest ? new XMLHttpRequest() : new ActiveXObject("Microsoft.XMLHTTP");

    xhr.open('POST', url);
    xhr.onreadystatechange = function() {
        if (xhr.readyState > 3 && xhr.status == 200) { success(xhr.responseText); }
    };
    xhr.setRequestHeader('X-Requested-With', 'XMLHttpRequest');
    xhr.setRequestHeader('Content-Type', 'application/x-www-form-urlencoded');
    xhr.send(params);
    return xhr;
}

function AjaxGet(url, success) {
    let xhr = window.XMLHttpRequest ? new XMLHttpRequest() : new ActiveXObject('Microsoft.XMLHTTP');
    xhr.open('GET', url);
    xhr.onreadystatechange = function() {
        if (xhr.readyState>3 && xhr.status==200) success(xhr.responseText);
    };
    xhr.setRequestHeader('X-Requested-With', 'XMLHttpRequest');
    xhr.send();
    return xhr;
}

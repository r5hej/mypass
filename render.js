"use strict";


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

window.onload = RenderLogin();

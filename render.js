"use strict";

function RenderBucket() {
    let bucket = document.getElementsById('buckets');

    JsT.get("templates.html", function(templates) {
        bucket.innerHTML = templates.bucketTable.render();
    });

    let tbody = document.getElementsById('bucket-tbody');
    JsT.get('templates.html', function(templates) {
        // foreach loop
        tbody.innerHTML += templates.bucketRow.render({

        })
    })

}

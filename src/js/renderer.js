"use strict";

const { ipcRenderer } = require("electron");

ipcRenderer.send("kanji-data-request", {
    "kanji": "蛍"
});

ipcRenderer.on("kanji-data-response", function(event, data) {
    document.getElementById("kanji-char").innerText = data.kanji;

    document.getElementById("grade-value").innerText = data.grade;
    document.getElementById("jlpt-value").innerText = data.jlpt;
    document.getElementById("strokes-value").innerText = data.stroke_count;

    for (let i = 0; i < data.meanings.length; i++) {
        let meaningListItem = document.createElement("li");
        meaningListItem.innerText = data.meanings[i];
        document.getElementById("meaning-value").appendChild(meaningListItem);
    }

    for (let i = 0; i < data.on_readings.length; i++) {
        let onyomiListItem = document.createElement("li");
        onyomiListItem.innerText = data.on_readings[i];
        document.getElementById("onyomi-value").appendChild(onyomiListItem);
    }

    for (let i = 0; i < data.kun_readings.length; i++) {
        let kunyomiListItem = document.createElement("li");
        kunyomiListItem.innerText = data.kun_readings[i];
        document.getElementById("kunyomi-value").appendChild(kunyomiListItem);
    }


});

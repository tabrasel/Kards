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
});

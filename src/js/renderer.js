"use strict";

const { ipcRenderer } = require("electron");

ipcRenderer.send("kanji-data-request", {
    "kanji": "小"
});

ipcRenderer.on("kanji-data-response", function(event, card) {
});

"use strict";

const { app, BrowserWindow, ipcMain} = require("electron");
const fs = require("fs");
const fetch = require('node-fetch');
var encodeUrl = require('encodeurl')

let mainWindow;

let deckCardFieldNames = [];
let deckCards;

function loadDeck(deckFileName) {
    let deckFile = fs.readFileSync("data/" + deckFileName);
    let deckObj = JSON.parse(deckFile);

    let deckCardFieldAttribs = deckObj.note_models[0].flds;

    for (let i = 0; i < deckCardFieldAttribs.length; i++) {
        let fieldAttribs = deckCardFieldAttribs[i];
        deckCardFieldNames.push(fieldAttribs.name);
    }

    deckCards = deckObj.notes;
}

function createWindow() {
    mainWindow = new BrowserWindow({
        width: 1280,
        height: 760,
        minWidth: 800,
        minHeight: 600,
        webPreferences: {
            nodeIntegration: true
        }
    })

    mainWindow.loadFile("src/html/index.html");

    loadDeck("deck.json");
}

app.on("ready", createWindow);

app.on("window-all-closed", function() {
    app.quit();
});

ipcMain.on("kanji-data-request", function(event, arg) {
    // Must encode the URL since it contains a unicode kanji character:
    // https://kanjiapi.dev/v1/kanji/小
    // https://kanjiapi.dev/v1/kanji/%E8%9B%8D
    let url = encodeUrl("https://kanjiapi.dev/v1/kanji/" + arg.kanji);

    fetch(url)
        .then(response => response.json())
        .then(data => {
            event.reply("kanji-data-response", data);
        })
        .catch(error => {
            event.reply("kanji-data-response", {});
            console.log(error)
        });
});

ipcMain.on("kanji-words-request", function(event, arg) {
    const url = encodeUrl("https://kanjiapi.dev/v1/words/" + arg.kanji);

    fetch(url)
        .then(response => response.json())
        .then(data => {
            const reply = {
                kanji: arg.kanji,
                words: data
            };

            event.reply("kanji-words-response", reply);
        })
        .catch(error => {
            event.reply("kanji-words-response", {});
            console.log(error)
        });
});

ipcMain.on("kanji-status-request", function(event, arg) {
    const userSaveFile = fs.readFileSync("data/saves/user1.json");
    const userSave = JSON.parse(userSaveFile);
    const status = userSave.kanjiStatus[arg.kanji];

    event.reply("kanji-status-response", status);
});

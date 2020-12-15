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
        width: 800,
        height: 600,
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

    // Load kanji learning stats

    fetch(url)
        .then(response => response.json())
        .then(data => {
            event.reply("kanji-data-response", data);
            //console.log(body);
        })
        .catch(error => {
            event.reply("kanji-data-response", {});
            console.log(error)
        });
});

"use strict";

const { app, BrowserWindow, ipcMain} = require("electron");
const fs = require("fs");

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

function camelize(str) {
  return str.replace(/(?:^\w|[A-Z]|\b\w|\s+)/g, function(match, index) {
    if (+match === 0) return "";
    return index === 0 ? match.toLowerCase() : match.toUpperCase();
  });
}

app.on("ready", createWindow);

app.on("window-all-closed", function() {
    app.quit();
});

ipcMain.on("kanji-data-request", function(event, arg) {
    let card = {};
    
    event.reply("kanji-data-response", card);
});

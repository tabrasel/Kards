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

ipcMain.on("card-request", function(event, arg) {
    let cardFields = deckCards[arg.index].fields;

    let kanji = cardFields[0];
    let onyomi = cardFields[1].split("、");
    let kunyomi = cardFields[2].split("、");
    let nanori = cardFields[3].split("、");
    let english = cardFields[4].split(", ");
    let strokeCount = parseInt(cardFields[10]);

    let exampleStrings = cardFields[5].split("<br>");
    let examples = [];
    for (let i = 0; i < exampleStrings.length; i++) {
        let exampleString = exampleStrings[i];

        let example = {
            "kanji": exampleString.match(/^.*?(?=\()/).pop(),
            "reading": exampleString.match(/(?<=\().+?(?=\))/).pop(),
            "english": exampleString.match(/(?<=\: ).*$/).pop()
        };

        examples.push(example);
    }

    let card = {
        "kanji": kanji,
        "onyomi": onyomi,
        "kunyomi": kunyomi,
        "nanori": nanori,
        "english": english,
        "strokeCount": strokeCount,
        "examples": examples
    };

    console.log(card);

    event.reply("card-response", card);
});

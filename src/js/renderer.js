"use strict";

const { ipcRenderer } = require("electron");

KanjiCanvas.init("drawing-canvas");

document.getElementById("drawing-search-button").addEventListener("click", function() {
    let recognizedKanji = KanjiCanvas.recognize("drawing-canvas");

    let choicesAreaElement = document.getElementById("choices-area");
    choicesAreaElement.innerHTML = "";

    for (let i = 0; i < recognizedKanji.length; i += 3) {

            let choiceCardElement = document.createElement("div");
            choiceCardElement.classList.add("choice-card");

            let choiceTextElement = document.createElement("p");
            choiceTextElement.innerText = recognizedKanji[i];

            choiceCardElement.appendChild(choiceTextElement);
            choicesAreaElement.appendChild(choiceCardElement);
    }
});

document.getElementById("drawing-undo-button").addEventListener("click", function() {
    KanjiCanvas.deleteLast("drawing-canvas");
});

document.getElementById("drawing-clear-button").addEventListener("click", function() {
    KanjiCanvas.erase("drawing-canvas");

    let choicesAreaElement = document.getElementById("choices-area");
    choicesAreaElement.innerHTML = "";
});

ipcRenderer.send("card-request", {
    "index": Math.floor(Math.random() * 1000)
});

ipcRenderer.on("card-response", function(event, card) {
    let frontFields = [ "kanji" ];
    let backFields = [ "english", "onyomi", "kunyomi" ];

    let cardFrontElement = document.getElementById("card-prompt-area");
    let cardBackElement = document.getElementById("card-side-back");

    let englishElement = document.createElement("p");
    let onyomiElement = document.createElement("p");
    let kunyomiElement = document.createElement("p");

    let englishText = card.english[0];
    for (let i = 1; i < card.english.length; i++) {
        englishText += ", " + card.english[i];
    }

    let onyomiText = card.onyomi[0];
    for (let i = 1; i < card.onyomi.length; i++) {
        onyomiText += ", " + card.onyomi[i];
    }

    let kunyomiText = card.kunyomi[0];
    for (let i = 1; i < card.kunyomi.length; i++) {
        kunyomiText += ", " + card.kunyomi[i];
    }

    englishElement.innerText = englishText;
    onyomiElement.innerText = onyomiText;
    kunyomiElement.innerText = kunyomiText;

    cardFrontElement.appendChild(englishElement);
    cardFrontElement.appendChild(onyomiElement);
    cardFrontElement.appendChild(kunyomiElement);

    /*
    // Populate card front side
    for (let i = 0; i < frontFields.length; i++) {
        let fieldName = frontFields[i];
        let fieldText = card[fieldName].replace(/<br>/g, "\n");

        let fieldElement = document.createElement("p");
        fieldElement.innerText = fieldName + ": " + fieldText;
        cardFrontElement.appendChild(fieldElement);
    }

    // Populate card back side
    for (let i = 0; i < backFields.length; i++) {
        let fieldName = frontFields[i];
        let fieldText = card[fieldName].replace(/<br>/g, "\n");

        let fieldElement = document.createElement("p");
        fieldElement.innerText = fieldName + ": " + fieldText;
        //cardBackElement.appendChild(fieldElement);
    }
    */

    /*
    card.addEventListener("click", function() {
        card.classList.toggle("is-flipped");
    });
    */
});

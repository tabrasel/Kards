"use strict";

const { ipcRenderer } = require("electron");
const moment = require('moment');

ipcRenderer.send("kanji-data-request", {
    "kanji": "小"
});

ipcRenderer.send("kanji-words-request", {
    "kanji": "小"
});

ipcRenderer.send("kanji-status-request", {
    "kanji": "小"
});

ipcRenderer.on("kanji-data-response", function(event, data) {
    $("kanji-char").innerText = data.kanji;
    $("grade-value").innerText = data.grade;
    $("jlpt-value").innerText = data.jlpt;
    $("strokes-value").innerText = data.stroke_count;

    // Populate the English meaning(s)
    for (let i = 0; i < data.meanings.length; i++) {
        const meaningListItem = document.createElement("li");
        meaningListItem.innerText = data.meanings[i];
        $("meaning-value").appendChild(meaningListItem);
    }

    // Populate the onyomi reading(s)
    for (let i = 0; i < data.on_readings.length; i++) {
        const onyomiListItem = document.createElement("li");
        onyomiListItem.innerText = data.on_readings[i];
        $("onyomi-value").appendChild(onyomiListItem);
    }

    // Populate the kunyomi reading(s)
    for (let i = 0; i < data.kun_readings.length; i++) {
        const kunyomiListItem = document.createElement("li");
        kunyomiListItem.innerText = data.kun_readings[i];
        $("kunyomi-value").appendChild(kunyomiListItem);
    }
});

ipcRenderer.on("kanji-words-response", function(event, data) {
    const wordsList = $("words-table");
    const words = prioritizeWords(data.words, data.kanji);

    for (let i = 0; i < 10; i++) {
        const word = words[i];

        const wordSpellingDiv = createWordSpellingElement(word);
        const wordMeaningDiv = createWordMeaningElement(word);

        const wordRowDiv = document.createElement("div");
        wordRowDiv.classList.add("word-row");

        wordRowDiv.appendChild(wordSpellingDiv);
        wordRowDiv.appendChild(wordMeaningDiv);

        wordsList.appendChild(wordRowDiv);
    }
});

/**
 *
 */
ipcRenderer.on("kanji-status-response", function(event, status) {
    // Display the level bar
    const levelBar = $("level-bar");
    levelBar.innerHTML = "";

    let i = 0;
    for (let level = 0; level < 10; level++) {
        const levelTickDiv = document.createElement("div");
        levelTickDiv.classList.add("level-tick");

        if (i < status.level) {
            levelTickDiv.classList.add("filled-tick");
            i++;
        }

        levelBar.appendChild(levelTickDiv);
    }

    // Display time until next review
    if (status.nextStudyTime != null) {
        const nextReviewTime = moment(status.nextStudyTime);
        const timeToNextReview = nextReviewTime.fromNow();

        const nextReviewTimeSpan = $("next-review-time");
        nextReviewTimeSpan.innerText = timeToNextReview;
    }
});

function prioritizeWords(words, kanji) {
    const prioritizedWords = JSON.parse(JSON.stringify(words));
    prioritizedWords.sort((a, b) => compareWords(a, b, kanji));
    return prioritizedWords;
}

/**
 * Create a writing element for a vocab word entry.
 */
function createWordSpellingElement(word) {
    //<p><ruby>小銭<rt>ショウニン</rt></ruby></p>

    const wordSpellingRt = document.createElement("rt");
    wordSpellingRt.innerText = word.variants[0].pronounced;

    const wordSpellingRuby = document.createElement("ruby");
    wordSpellingRuby.innerText = word.variants[0].written;
    wordSpellingRuby.appendChild(wordSpellingRt);

    const wordSpellingP = document.createElement("p");
    wordSpellingP.appendChild(wordSpellingRuby);

    const wordSpellingDiv = document.createElement("div");
    wordSpellingDiv.classList.add("word-spelling");
    wordSpellingDiv.appendChild(wordSpellingP);

    return wordSpellingDiv;
}

/**
 * Create a meaning(s) element for a vocab word entry.
 */
function createWordMeaningElement(word) {
    const wordMeaningDiv = document.createElement("div");
    wordMeaningDiv.classList.add("word-meaning");

    // Enumerate meanings if there are more than one
    if (word.meanings.length > 1) {
        for (let j = 0; j < word.meanings.length; j++) {
            const meaning = word.meanings[j];
            const meaningP = document.createElement("p");

            meaningP.innerText = "(" + (j + 1) + ") " + meaning.glosses[0];

            if (meaning.glosses.length > 1) {
                for (let k = 1; k < meaning.glosses.length; k++) {
                    meaningP.innerText += "; " + meaning.glosses[k];
                }
            }

            wordMeaningDiv.appendChild(meaningP);
        }
    } else {
        const meaning = word.meanings[0];
        const meaningP = document.createElement("p");

        meaningP.innerText = meaning.glosses[0];

        if (meaning.glosses.length > 1) {
            for (let k = 1; k < meaning.glosses.length; k++) {
                meaningP.innerText += "; " + meaning.glosses[k];
            }
        }

        wordMeaningDiv.appendChild(meaningP);
    }

    return wordMeaningDiv;
}

/**
 *
 * Source: https://kai.kanjiapi.dev/ (index.js)
 */
function compareWords(word1, word2, kanji) {
    const score1 = scoreWord(word1, kanji);
    const score2 = scoreWord(word2, kanji);

    if (score1.validPriorityVariantLength !== score2.validPriorityVariantLength) {
        return score2.validPriorityVariantLength - score1.validPriorityVariantLength;
    }

    if (score1.firstVariantIsValid !== score2.firstVariantIsValid) {
        return score2.firstVariantIsValid - score1.firstVariantIsValid;
    }

    if (score1.hasPriorityVariant !== score2.hasPriorityVariant) {
        return score2.hasPriorityVariant - score1.hasPriorityVariant;
    }

    return score1.minWordLength - score2.minWordLength;
}

function scoreWord(word, kanji) {
    const variantsWithKanji = word.variants
        .filter(isValidVariant.bind(null, kanji));

    const validPriorityVariant = variantsWithKanji
        .find(isPriorityVariant);

    const validPriorityVariantLength = (
        validPriorityVariant ?
        validPriorityVariant.priorities.length :
        0
    );

    // The word has a high-priority variant
    const hasPriorityVariant = word.variants
        .some(isPriorityVariant);

    // The word's first variant actually contains the kanji
    const firstVariantIsValid = isValidVariant(kanji, word.variants[0]);

    const minWordLength = (
        validPriorityVariant ?
        validPriorityVariant.written.length :
        variantsWithKanji
            .reduce((acc, curr) => Math.min(acc, curr.written.length), Infinity)
    );

    return {
        validPriorityVariantLength,
        firstVariantIsValid,
        minWordLength,
        hasPriorityVariant,
    };
}

/**
 * Determines if a kanji vocab word variant actually includes the kanji.
 */
function isValidVariant(kanji, variant) {
    return variant.written.includes(kanji);
}

/**
 * Determines if a kanji vocab word is marked with a high priority.
 */
function isPriorityVariant(variant) {
    return variant.priorities.length > 0;
}

function $(id) {
    return document.getElementById(id);
}

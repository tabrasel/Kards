"use strict";

const { ipcRenderer } = require("electron");

ipcRenderer.send("kanji-data-request", {
    "kanji": "蛍"
});

ipcRenderer.send("kanji-words-request", {
    "kanji": "蛍"
});

ipcRenderer.on("kanji-data-response", function(event, data) {
    $("kanji-char").innerText = data.kanji;
    $("grade-value").innerText = data.grade;
    $("jlpt-value").innerText = data.jlpt;
    $("strokes-value").innerText = data.stroke_count;

    // Populate the English meaning(s)
    for (let i = 0; i < data.meanings.length; i++) {
        let meaningListItem = document.createElement("li");
        meaningListItem.innerText = data.meanings[i];
        $("meaning-value").appendChild(meaningListItem);
    }

    // Populate the onyomi reading(s)
    for (let i = 0; i < data.on_readings.length; i++) {
        let onyomiListItem = document.createElement("li");
        onyomiListItem.innerText = data.on_readings[i];
        $("onyomi-value").appendChild(onyomiListItem);
    }

    // Populate the kunyomi reading(s)
    for (let i = 0; i < data.kun_readings.length; i++) {
        let kunyomiListItem = document.createElement("li");
        kunyomiListItem.innerText = data.kun_readings[i];
        $("kunyomi-value").appendChild(kunyomiListItem);
    }
});

ipcRenderer.on("kanji-words-response", function(event, data) {
    let wordsList = $("words-table");
    let words = prioritizeWords(data.words, data.kanji);

    for (let i = 0; i < 10; i++) {
        let word = words[i];

        let wordWritingDiv = createWordWritingElement(word);
        let wordMeaningDiv = createWordMeaningElement(word);

        /*
        <tr>
            <th><ruby>小銭<rt>ショウニン</rt></ruby></th>
            <td>small change; coins</td>
        </tr>
        */

        let wordRowDiv = document.createElement("div");
        wordRowDiv.classList.add("word-row");

        wordRowDiv.appendChild(wordWritingDiv);
        wordRowDiv.appendChild(wordMeaningDiv);

        wordsList.appendChild(wordRowDiv);
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
function createWordWritingElement(word) {
    let wordWritingP = document.createElement("p");
    wordWritingP.innerText = word.variants[0].written;

    let wordWritingDiv = document.createElement("div");
    wordWritingDiv.classList.add("word-writing");
    wordWritingDiv.appendChild(wordWritingP);

    return wordWritingDiv;
}

/**
 * Create a meaning(s) element for a vocab word entry.
 */
function createWordMeaningElement(word) {
    let wordMeaningDiv = document.createElement("div");
    wordMeaningDiv.classList.add("word-meaning");

    // Enumerate meanings if there are more than one
    if (word.meanings.length > 1) {
        for (let j = 0; j < word.meanings.length; j++) {
            let meaning = word.meanings[j];
            let meaningP = document.createElement("p");

            meaningP.innerText = "(" + (j + 1) + ") " + meaning.glosses[0];

            if (meaning.glosses.length > 1) {
                for (let k = 1; k < meaning.glosses.length; k++) {
                    meaningP.innerText += "; " + meaning.glosses[k];
                }
            }

            wordMeaningDiv.appendChild(meaningP);
        }
    } else {
        let meaning = word.meanings[0];
        let meaningP = document.createElement("p");

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

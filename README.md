# Kards

Kards is a simple flashcard application for learning kanji, including their characters, meanings, readings, and use in
Japanese vocabulary.

## Future goals

### General

* Saved user progress

### Study methods

* *Prompts a kanji character:* Select the kanji's English meaning from several choices
* *Prompts a kanji's english meaning(s) and readings:* Draw the kanji character
* *Prompts a Japanese word with one kanji highlighted:* Type the reading of the highlighted kanji
* *Prompts a Japanese word:* Type the full reading of the word

## Installing & launching

1. Clone or download the Kard repo
2. Navigate to the repo directory
3. Run `npm install --save-dev electron`. This loads all of the required node modules, so it may
take a minute or two
4. Run `npm start` to launch the application

## Helpful development resources

* [Build a file metadata app in Electron](https://codeburst.io/build-a-file-metadata-app-in-electron-a0fe8d32410e)

## Tools, libraries, etc.

* [kanjiAPI](https://kanjiapi.dev/#!/)
* [kanjicanvas](https://github.com/asdfjkl/kanjicanvas)

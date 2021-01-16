# Use intructions:
# > cd data/
# > python3 generate_user_save.py [username]

import json
import sys

username = sys.argv[1]

inputFile = open('kanji_jouyou.txt', 'r')
outputFile = username + '.json'
outputFilePath = 'saves/' + outputFile

# Generate learning status for each kanji
kanjiStatus = {}

for line in inputFile:
    line = line.strip()

    if len(line) == 0 or line.startswith('#'):
        continue

    kanjis = line.split(' ')

    for kanji in kanjis:
        status = {
            'level' : -1,
            'nextReviewTime' : None
        }

        kanjiStatus[kanji] = status;

# Generate save file object
saveData = {
    'username' : username,
    'learnedKanjiCount' : 0,
    'kanjiStatus' : kanjiStatus
}

with open(outputFilePath, 'w', encoding = 'utf-8') as f:
    f.write(json.dumps(saveData, ensure_ascii = False, indent = 4))

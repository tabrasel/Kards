# Use: python3 generate_user_save.py [username]

import json
import sys

inputFile = open('kanji_jouyou.txt', 'r')
outputFile = sys.argv[1] + '.json'
outputFilePath = 'saves/' + outputFile

kanjiData = {}

for line in inputFile:
    if len(line.strip()) == 0 or line.startswith('#'):
        continue

    characters = line.strip().split(' ')

    for character in characters:
        data = {
            'level' : -1,
            'nextReviewTime' : None
        }

        kanjiData[character] = data;

with open(outputFilePath, 'w', encoding = 'utf-8') as f:
    f.write(json.dumps(kanjiData, ensure_ascii = False, indent = 4))

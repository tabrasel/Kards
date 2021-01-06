import json

inputFile = open('kanji_jouyou.txt', 'r')

kanjiData = {}

for line in inputFile:
    if len(line.strip()) == 0 or line.startswith('#'):
        continue

    characters = line.strip().split(' ')

    for character in characters:
        data = {
            'isDiscovered' : False,
            'level' : 1,
            'nextReviewTime' : None
        }

        kanjiData[character] = data;

with open('saves/user1.json', 'w', encoding = 'utf-8') as f:
    f.write(json.dumps(kanjiData, ensure_ascii = False, indent = 4))

# -*- coding: utf-8 -*-
import re
import sys

sys.stdout.reconfigure(encoding='utf-8')

with open('c:/Users/mjuy1/Desktop/connectaillab/bible-platform/src/data/quizData.js', 'r', encoding='utf-8') as f:
    text = f.read()

# id와 category, roundTitle, description 파싱
items = []
current = {}
for line in text.splitlines():
    line = line.strip()
    if line.startswith('"id":'):
        current['id'] = line.split('"')[3]
    elif line.startswith('"category":'):
        current['category'] = line.split('"')[3]
    elif line.startswith('"roundTitle":'):
        current['roundTitle'] = line.split('"')[3]
    elif line.startswith('"description":'):
        current['description'] = line.split('"')[3]
    elif line.startswith('"bookName":'):
        current['bookName'] = line.split('"')[3]
    elif line == '},' or line == '}':
        if 'id' in current and 'category' in current:
            items.append(current)
            current = {}

print(f"Total quiz sets: {len(items)}")
categories = {}
for item in items:
    cat = item.get('category', '기타')
    if cat not in categories:
        categories[cat] = []
    categories[cat].append(item)

for cat, sets in categories.items():
    print(f"[{cat}] : {len(sets)}세트")
    for s in sets[:2]:
        print(f"   - {s.get('id')}: {s.get('roundTitle')} / {s.get('description')}")

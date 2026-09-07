# -*- coding: utf-8 -*-
import json
import re
import os

with open('src/data/dailyVerses.js', 'r', encoding='utf-8') as f:
    text = f.read()

match = re.search(r'export const baseVerses = (\[[\s\S]*?\]);', text)
if not match:
    print("Could not find baseVerses in src/data/dailyVerses.js")
    exit(1)

verses = json.loads(match.group(1))
print(f"Loaded {len(verses)} verses")

# Print the first 10 verses to inspect their refs and text
for i, v in enumerate(verses[:10]):
    print(f"[{i}] {v['ref']}: {v['text']}")

# -*- coding: utf-8 -*-
import sys
sys.stdout.reconfigure(encoding='utf-8')

with open('c:/Users/mjuy1/Desktop/connectaillab/bible-platform/src/data/quizData.js', 'r', encoding='utf-8') as f:
    text = f.read()

import re
pattern = re.compile(r'"id":\s*"([^"]+)"')
all_quiz_ids = pattern.findall(text)
print(f"Total IDs in quizData.js: {len(all_quiz_ids)}")

with open('c:/Users/mjuy1/Desktop/connectaillab/bible-platform/src/data/bibleProjectVideos.js', 'r', encoding='utf-8') as f:
    v_text = f.read()

# WEEKLY_VIDEOS_MAP 또는 ALL_SET_VIDEOS_MAP에 있는지 검사
missing = []
for qid in all_quiz_ids:
    if f'"{qid}":' not in v_text and not qid.startswith('week_'):
        missing.append(qid)

print(f"Missing IDs in bibleProjectVideos.js: {len(missing)}")
if missing:
    print(f"Sample missing: {missing[:10]}")

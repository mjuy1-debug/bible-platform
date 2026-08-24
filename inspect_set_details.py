# -*- coding: utf-8 -*-
# inspect_set_details.py
import json
import re
import sys

sys.stdout.reconfigure(encoding='utf-8')

with open('c:/Users/mjuy1/Desktop/connectaillab/bible-platform/src/data/quizData.js', 'r', encoding='utf-8') as f:
    text = f.read()

# JSON 파싱을 위해 BIBLE_QUIZ_LIST 추출
idx = text.find('export const BIBLE_QUIZ_LIST = ')
if idx != -1:
    json_str = text[idx + len('export const BIBLE_QUIZ_LIST = '):].strip()
    if json_str.endswith(';'):
        json_str = json_str[:-1]
    quiz_list = json.loads(json_str)
    print(f"Successfully loaded {len(quiz_list)} sets from JSON!")

    # 카테고리별 샘플 1개씩 질문 분석
    categories = {}
    for q in quiz_list:
        cat = q.get('category', '')
        if cat not in categories:
            categories[cat] = []
        categories[cat].append(q)

    for cat, items in categories.items():
        sample = items[0]
        q_texts = [q['question'] for q in sample.get('questions', [])[:3]]
        print(f"\n[{cat}] ({len(items)} sets)")
        print(f"Sample: {sample['id']} / {sample['roundTitle']}")
        print(f"Questions: {q_texts}")

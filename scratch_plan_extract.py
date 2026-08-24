# -*- coding: utf-8 -*-
import json
import re

# weeklyReadingPlanData.js에서 주차별 데이터 파싱
with open('c:/Users/mjuy1/Desktop/connectaillab/bible-platform/src/data/weeklyReadingPlanData.js', 'r', encoding='utf-8') as f:
    plan_content = f.read()

# 전체 52주차별 영상 기획 데이터 생성
weekly_video_data = {}

# 52주차 기본 매핑 정의
for w in range(1, 53):
    # 각 주차별 고유한 테마 및 2~4개 영상 세트
    pass

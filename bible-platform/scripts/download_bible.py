"""
KRV (개역한글) 성경 전체 다운로드 스크립트
bolls.life API → public/bible/{bookId}.json 저장
"""
import requests, json, os, time

BASE_URL = "https://bolls.life"
TRANSLATION = "KRV"
OUT_DIR = os.path.join(os.path.dirname(__file__), "..", "public", "bible")
os.makedirs(OUT_DIR, exist_ok=True)

# 66권 정보: (bookId, apiNumber, 장수)
BOOKS = [
    ("gen",1,50),("exo",2,40),("lev",3,27),("num",4,36),("deu",5,34),
    ("jos",6,24),("jdg",7,21),("rut",8,4),("1sa",9,31),("2sa",10,24),
    ("1ki",11,22),("2ki",12,25),("1ch",13,29),("2ch",14,36),("ezr",15,10),
    ("neh",16,13),("est",17,10),("job",18,42),("psa",19,150),("pro",20,31),
    ("ecc",21,12),("sng",22,8),("isa",23,66),("jer",24,52),("lam",25,5),
    ("eze",26,48),("dan",27,12),("hos",28,14),("joe",29,3),("amo",30,9),
    ("oba",31,1),("jon",32,4),("mic",33,7),("nah",34,3),("hab",35,3),
    ("zep",36,3),("hag",37,2),("zec",38,14),("mal",39,4),
    ("mat",40,28),("mar",41,16),("luk",42,24),("joh",43,21),("act",44,28),
    ("rom",45,16),("1co",46,16),("2co",47,13),("gal",48,6),("eph",49,6),
    ("php",50,4),("col",51,4),("1th",52,5),("2th",53,3),("1ti",54,6),
    ("2ti",55,4),("tit",56,3),("phm",57,1),("heb",58,13),("jam",59,5),
    ("1pe",60,5),("2pe",61,3),("1jo",62,5),("2jo",63,1),("3jo",64,1),
    ("jud",65,1),("rev",66,22),
]

session = requests.Session()
session.headers.update({"Accept": "application/json", "User-Agent": "Mozilla/5.0"})

total_books = len(BOOKS)
for i, (book_id, api_num, chapters) in enumerate(BOOKS):
    out_path = os.path.join(OUT_DIR, f"{book_id}.json")
    if os.path.exists(out_path):
        print(f"[{i+1}/{total_books}] {book_id} - 이미 존재, 건너뜀")
        continue

    book_data = {}
    print(f"[{i+1}/{total_books}] {book_id} 다운로드 중... ({chapters}장)")
    success = True

    for ch in range(1, chapters + 1):
        url = f"{BASE_URL}/get-chapter/{TRANSLATION}/{api_num}/{ch}/"
        for attempt in range(3):
            try:
                r = session.get(url, timeout=15)
                if r.status_code == 200:
                    raw = r.json()
                    if isinstance(raw, list) and len(raw) > 0:
                        book_data[str(ch)] = [
                            {
                                "verse": v["verse"],
                                "text": v["text"]
                                    .replace("<br>", " ")
                                    .replace("<BR>", " ")
                                    .replace("&nbsp;", " ")
                                    .replace("&amp;", "&")
                                    .replace("&lt;", "<")
                                    .replace("&gt;", ">")
                                    .strip()
                            }
                            for v in raw
                        ]
                        break
                    else:
                        print(f"  {book_id} {ch}장: 빈 응답")
                        book_data[str(ch)] = []
                        break
                else:
                    print(f"  {book_id} {ch}장: HTTP {r.status_code}, 재시도 {attempt+1}")
                    time.sleep(1)
            except Exception as e:
                print(f"  {book_id} {ch}장: 오류 {e}, 재시도 {attempt+1}")
                time.sleep(2)
        else:
            print(f"  {book_id} {ch}장: 실패 - 건너뜀")
            book_data[str(ch)] = []
            success = False

        time.sleep(0.05)  # rate limit 방지

    with open(out_path, "w", encoding="utf-8") as f:
        json.dump(book_data, f, ensure_ascii=False, separators=(",", ":"))

    status = "완료" if success else "일부 실패"
    size_kb = os.path.getsize(out_path) / 1024
    print(f"  → 저장 완료: {out_path} ({size_kb:.1f} KB) [{status}]")
    time.sleep(0.1)

print("\n✅ 전체 다운로드 완료!")
print(f"저장 위치: {OUT_DIR}")
total_size = sum(os.path.getsize(os.path.join(OUT_DIR, f)) for f in os.listdir(OUT_DIR) if f.endswith(".json"))
print(f"총 용량: {total_size / 1024 / 1024:.1f} MB")

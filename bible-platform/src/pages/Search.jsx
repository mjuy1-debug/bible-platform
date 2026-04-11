import React, { useState, useCallback, useContext } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search as SearchIcon, Tag, Heart, Loader2, X, ChevronDown, BookOpen } from 'lucide-react';
import { UserContext } from '../context/UserContext';
import { Link } from 'react-router-dom';

// bolls.life API 책 번호 매핑
const BOOK_API_MAP = {
  '창세기':1,'출애굽기':2,'레위기':3,'민수기':4,'신명기':5,'여호수아':6,'사사기':7,'룻기':8,
  '사무엘상':9,'사무엘하':10,'열왕기상':11,'열왕기하':12,'역대상':13,'역대하':14,'에스라':15,
  '느헤미야':16,'에스더':17,'욥기':18,'시편':19,'잠언':20,'전도서':21,'아가':22,'이사야':23,
  '예레미야':24,'예레미야애가':25,'에스겔':26,'다니엘':27,'호세아':28,'요엘':29,'아모스':30,
  '오바댜':31,'요나':32,'미가':33,'나훔':34,'하박국':35,'스바냐':36,'학개':37,'스가랴':38,
  '말라기':39,'마태복음':40,'마가복음':41,'누가복음':42,'요한복음':43,'사도행전':44,'로마서':45,
  '고린도전서':46,'고린도후서':47,'갈라디아서':48,'에베소서':49,'빌립보서':50,'골로새서':51,
  '데살로니가전서':52,'데살로니가후서':53,'디모데전서':54,'디모데후서':55,'디도서':56,
  '빌레몬서':57,'히브리서':58,'야고보서':59,'베드로전서':60,'베드로후서':61,'요한일서':62,
  '요한이서':63,'요한삼서':64,'유다서':65,'요한계시록':66,'애가':25,
};

// 역방향 매핑: 책 번호 → 한국어 이름
const BOOK_NUM_TO_NAME = {};
Object.entries(BOOK_API_MAP).forEach(([name, num]) => {
  if (!BOOK_NUM_TO_NAME[num]) BOOK_NUM_TO_NAME[num] = name;
});

// 주제별 구절 (12개씩)
const TOPIC_VERSES = {
  '위로': [
    { ref: '시편 34:18',        book: 19, ch: 34,  v: 18 },
    { ref: '마태복음 11:28',    book: 40, ch: 11,  v: 28 },
    { ref: '이사야 41:10',      book: 23, ch: 41,  v: 10 },
    { ref: '요한복음 14:27',    book: 43, ch: 14,  v: 27 },
    { ref: '시편 23:4',         book: 19, ch: 23,  v: 4  },
    { ref: '고린도후서 1:3',    book: 47, ch: 1,   v: 3  },
    { ref: '이사야 43:2',       book: 23, ch: 43,  v: 2  },
    { ref: '시편 46:1',         book: 19, ch: 46,  v: 1  },
    { ref: '요한복음 16:33',    book: 43, ch: 16,  v: 33 },
    { ref: '로마서 8:28',       book: 45, ch: 8,   v: 28 },
    { ref: '시편 55:22',        book: 19, ch: 55,  v: 22 },
    { ref: '베드로전서 5:7',    book: 60, ch: 5,   v: 7  },
  ],
  '용기': [
    { ref: '여호수아 1:9',      book: 6,  ch: 1,   v: 9  },
    { ref: '시편 27:1',         book: 19, ch: 27,  v: 1  },
    { ref: '빌립보서 4:13',     book: 50, ch: 4,   v: 13 },
    { ref: '이사야 40:31',      book: 23, ch: 40,  v: 31 },
    { ref: '신명기 31:6',       book: 5,  ch: 31,  v: 6  },
    { ref: '시편 31:24',        book: 19, ch: 31,  v: 24 },
    { ref: '이사야 41:13',      book: 23, ch: 41,  v: 13 },
    { ref: '요한복음 16:33',    book: 43, ch: 16,  v: 33 },
    { ref: '로마서 8:31',       book: 45, ch: 8,   v: 31 },
    { ref: '시편 118:6',        book: 19, ch: 118, v: 6  },
    { ref: '에베소서 6:10',     book: 49, ch: 6,   v: 10 },
    { ref: '디모데후서 1:7',    book: 55, ch: 1,   v: 7  },
  ],
  '사랑': [
    { ref: '요한복음 3:16',     book: 43, ch: 3,   v: 16 },
    { ref: '고린도전서 13:4',   book: 46, ch: 13,  v: 4  },
    { ref: '로마서 8:38',       book: 45, ch: 8,   v: 38 },
    { ref: '요한일서 4:8',      book: 62, ch: 4,   v: 8  },
    { ref: '요한복음 15:13',    book: 43, ch: 15,  v: 13 },
    { ref: '고린도전서 13:13',  book: 46, ch: 13,  v: 13 },
    { ref: '에베소서 3:18',     book: 49, ch: 3,   v: 18 },
    { ref: '요한일서 4:19',     book: 62, ch: 4,   v: 19 },
    { ref: '신명기 6:5',        book: 5,  ch: 6,   v: 5  },
    { ref: '로마서 5:8',        book: 45, ch: 5,   v: 8  },
    { ref: '요한복음 13:34',    book: 43, ch: 13,  v: 34 },
    { ref: '골로새서 3:14',     book: 51, ch: 3,   v: 14 },
  ],
  '믿음': [
    { ref: '히브리서 11:1',     book: 58, ch: 11,  v: 1  },
    { ref: '마가복음 11:22',    book: 41, ch: 11,  v: 22 },
    { ref: '로마서 10:17',      book: 45, ch: 10,  v: 17 },
    { ref: '야고보서 2:17',     book: 59, ch: 2,   v: 17 },
    { ref: '히브리서 11:6',     book: 58, ch: 11,  v: 6  },
    { ref: '갈라디아서 2:20',   book: 48, ch: 2,   v: 20 },
    { ref: '마태복음 17:20',    book: 40, ch: 17,  v: 20 },
    { ref: '로마서 1:17',       book: 45, ch: 1,   v: 17 },
    { ref: '에베소서 2:8',      book: 49, ch: 2,   v: 8  },
    { ref: '빌립보서 1:6',      book: 50, ch: 1,   v: 6  },
    { ref: '시편 37:5',         book: 19, ch: 37,  v: 5  },
    { ref: '잠언 3:5',          book: 20, ch: 3,   v: 5  },
  ],
  '인내': [
    { ref: '야고보서 1:3',      book: 59, ch: 1,   v: 3  },
    { ref: '로마서 5:3',        book: 45, ch: 5,   v: 3  },
    { ref: '히브리서 12:1',     book: 58, ch: 12,  v: 1  },
    { ref: '시편 40:1',         book: 19, ch: 40,  v: 1  },
    { ref: '야고보서 5:11',     book: 59, ch: 5,   v: 11 },
    { ref: '로마서 15:4',       book: 45, ch: 15,  v: 4  },
    { ref: '갈라디아서 6:9',    book: 48, ch: 6,   v: 9  },
    { ref: '이사야 40:31',      book: 23, ch: 40,  v: 31 },
    { ref: '시편 27:14',        book: 19, ch: 27,  v: 14 },
    { ref: '히브리서 10:36',    book: 58, ch: 10,  v: 36 },
    { ref: '요한계시록 2:10',   book: 66, ch: 2,   v: 10 },
    { ref: '골로새서 1:11',     book: 51, ch: 1,   v: 11 },
  ],
  '감사': [
    { ref: '데살로니가전서 5:18', book: 52, ch: 5, v: 18 },
    { ref: '시편 100:4',        book: 19, ch: 100, v: 4  },
    { ref: '골로새서 3:17',     book: 51, ch: 3,   v: 17 },
    { ref: '빌립보서 4:6',      book: 50, ch: 4,   v: 6  },
    { ref: '시편 107:1',        book: 19, ch: 107, v: 1  },
    { ref: '에베소서 5:20',     book: 49, ch: 5,   v: 20 },
    { ref: '시편 136:1',        book: 19, ch: 136, v: 1  },
    { ref: '시편 118:24',       book: 19, ch: 118, v: 24 },
    { ref: '골로새서 4:2',      book: 51, ch: 4,   v: 2  },
    { ref: '고린도후서 9:15',   book: 47, ch: 9,   v: 15 },
    { ref: '히브리서 13:15',    book: 58, ch: 13,  v: 15 },
    { ref: '시편 103:1',        book: 19, ch: 103, v: 1  },
  ],
  '평안': [
    { ref: '빌립보서 4:7',      book: 50, ch: 4,   v: 7  },
    { ref: '요한복음 14:27',    book: 43, ch: 14,  v: 27 },
    { ref: '이사야 26:3',       book: 23, ch: 26,  v: 3  },
    { ref: '시편 23:2',         book: 19, ch: 23,  v: 2  },
    { ref: '로마서 5:1',        book: 45, ch: 5,   v: 1  },
    { ref: '요한복음 16:33',    book: 43, ch: 16,  v: 33 },
    { ref: '이사야 9:6',        book: 23, ch: 9,   v: 6  },
    { ref: '시편 4:8',          book: 19, ch: 4,   v: 8  },
    { ref: '골로새서 3:15',     book: 51, ch: 3,   v: 15 },
    { ref: '마태복음 11:29',    book: 40, ch: 11,  v: 29 },
    { ref: '시편 29:11',        book: 19, ch: 29,  v: 11 },
    { ref: '갈라디아서 5:22',   book: 48, ch: 5,   v: 22 },
  ],
  '기도': [
    { ref: '마태복음 7:7',      book: 40, ch: 7,   v: 7  },
    { ref: '빌립보서 4:6',      book: 50, ch: 4,   v: 6  },
    { ref: '야고보서 5:16',     book: 59, ch: 5,   v: 16 },
    { ref: '시편 17:6',         book: 19, ch: 17,  v: 6  },
    { ref: '마가복음 11:24',    book: 41, ch: 11,  v: 24 },
    { ref: '마태복음 6:9',      book: 40, ch: 6,   v: 9  },
    { ref: '시편 5:2',          book: 19, ch: 5,   v: 2  },
    { ref: '데살로니가전서 5:17', book: 52, ch: 5, v: 17 },
    { ref: '요한일서 5:14',     book: 62, ch: 5,   v: 14 },
    { ref: '로마서 8:26',       book: 45, ch: 8,   v: 26 },
    { ref: '시편 145:18',       book: 19, ch: 145, v: 18 },
    { ref: '에베소서 6:18',     book: 49, ch: 6,   v: 18 },
  ],
  '지혜': [
    { ref: '잠언 3:5',          book: 20, ch: 3,   v: 5  },
    { ref: '야고보서 1:5',      book: 59, ch: 1,   v: 5  },
    { ref: '시편 111:10',       book: 19, ch: 111, v: 10 },
    { ref: '잠언 9:10',         book: 20, ch: 9,   v: 10 },
    { ref: '잠언 1:7',          book: 20, ch: 1,   v: 7  },
    { ref: '잠언 4:7',          book: 20, ch: 4,   v: 7  },
    { ref: '잠언 2:6',          book: 20, ch: 2,   v: 6  },
    { ref: '골로새서 1:9',      book: 51, ch: 1,   v: 9  },
    { ref: '시편 119:105',      book: 19, ch: 119, v: 105},
    { ref: '전도서 12:13',      book: 21, ch: 12,  v: 13 },
    { ref: '잠언 11:2',         book: 20, ch: 11,  v: 2  },
    { ref: '에베소서 1:17',     book: 49, ch: 1,   v: 17 },
  ],
  '소망': [
    { ref: '로마서 15:13',      book: 45, ch: 15,  v: 13 },
    { ref: '예레미야 29:11',    book: 24, ch: 29,  v: 11 },
    { ref: '시편 71:5',         book: 19, ch: 71,  v: 5  },
    { ref: '히브리서 6:19',     book: 58, ch: 6,   v: 19 },
    { ref: '로마서 8:24',       book: 45, ch: 8,   v: 24 },
    { ref: '시편 43:5',         book: 19, ch: 43,  v: 5  },
    { ref: '이사야 40:31',      book: 23, ch: 40,  v: 31 },
    { ref: '애가 3:24',         book: 25, ch: 3,   v: 24 },
    { ref: '시편 130:5',        book: 19, ch: 130, v: 5  },
    { ref: '디도서 2:13',       book: 56, ch: 2,   v: 13 },
    { ref: '로마서 5:4',        book: 45, ch: 5,   v: 4  },
    { ref: '베드로전서 1:3',    book: 60, ch: 1,   v: 3  },
  ],
  '치유': [
    { ref: '시편 147:3',        book: 19, ch: 147, v: 3  },
    { ref: '이사야 53:5',       book: 23, ch: 53,  v: 5  },
    { ref: '예레미야 17:14',    book: 24, ch: 17,  v: 14 },
    { ref: '야고보서 5:15',     book: 59, ch: 5,   v: 15 },
    { ref: '시편 30:2',         book: 19, ch: 30,  v: 2  },
    { ref: '마태복음 9:22',     book: 40, ch: 9,   v: 22 },
    { ref: '출애굽기 15:26',    book: 2,  ch: 15,  v: 26 },
    { ref: '시편 41:3',         book: 19, ch: 41,  v: 3  },
    { ref: '베드로전서 2:24',   book: 60, ch: 2,   v: 24 },
    { ref: '잠언 4:22',         book: 20, ch: 4,   v: 22 },
  ],
  '보호': [
    { ref: '시편 91:1',         book: 19, ch: 91,  v: 1  },
    { ref: '시편 121:7',        book: 19, ch: 121, v: 7  },
    { ref: '이사야 43:2',       book: 23, ch: 43,  v: 2  },
    { ref: '시편 34:7',         book: 19, ch: 34,  v: 7  },
    { ref: '잠언 18:10',        book: 20, ch: 18,  v: 10 },
    { ref: '신명기 33:27',      book: 5,  ch: 33,  v: 27 },
    { ref: '시편 46:1',         book: 19, ch: 46,  v: 1  },
    { ref: '로마서 8:31',       book: 45, ch: 8,   v: 31 },
    { ref: '요한복음 10:28',    book: 43, ch: 10,  v: 28 },
    { ref: '시편 23:4',         book: 19, ch: 23,  v: 4  },
  ],
  '축복': [
    { ref: '민수기 6:24',       book: 4,  ch: 6,   v: 24 },
    { ref: '신명기 28:2',       book: 5,  ch: 28,  v: 2  },
    { ref: '에베소서 1:3',      book: 49, ch: 1,   v: 3  },
    { ref: '시편 1:1',          book: 19, ch: 1,   v: 1  },
    { ref: '잠언 10:22',        book: 20, ch: 10,  v: 22 },
    { ref: '말라기 3:10',       book: 39, ch: 3,   v: 10 },
    { ref: '시편 37:4',         book: 19, ch: 37,  v: 4  },
    { ref: '요한복음 10:10',    book: 43, ch: 10,  v: 10 },
    { ref: '갈라디아서 3:9',    book: 48, ch: 3,   v: 9  },
    { ref: '시편 128:1',        book: 19, ch: 128, v: 1  },
  ],
};

const TOPICS = Object.keys(TOPIC_VERSES);
const PAGE_SIZE = 4; // 처음 보여줄 개수

const cleanText = (html) =>
  html.replace(/<[^>]+>/g, '').replace(/&nbsp;/g, ' ').replace(/&amp;/g, '&').replace(/\s+/g, ' ').trim();

const fetchVerse = async ({ book, ch, v }) => {
  const url = `https://bolls.life/get-chapter/KRV/${book}/${ch}/`;
  const res = await fetch(url, { headers: { Accept: 'application/json' } });
  if (!res.ok) throw new Error('not found');
  const data = await res.json();
  const verseObj = Array.isArray(data) ? data.find(item => item.verse === v) : null;
  if (!verseObj) throw new Error('verse not found');
  return cleanText(verseObj.text);
};

// 전체 성경 텍스트 검색: 주요 66권에서 키워드를 포함하는 구절 찾기
const SEARCH_BOOKS = [
  // 검색 우선 순위가 높은 책들 (시편, 잠언, 복음서, 서신서 등)
  { num: 19, name: '시편',     chapters: [1,23,27,34,37,40,46,51,91,100,103,107,119,121,139,145,147] },
  { num: 20, name: '잠언',     chapters: [1,2,3,4,9,10,11,15,16,22,31] },
  { num: 23, name: '이사야',   chapters: [9,26,40,41,43,53,55,61] },
  { num: 43, name: '요한복음', chapters: [1,3,10,13,14,15,16] },
  { num: 40, name: '마태복음', chapters: [5,6,7,11,22,28] },
  { num: 45, name: '로마서',   chapters: [5,8,10,12,15] },
  { num: 46, name: '고린도전서', chapters: [1,10,13,15] },
  { num: 49, name: '에베소서', chapters: [1,2,3,4,6] },
  { num: 50, name: '빌립보서', chapters: [1,2,3,4] },
  { num: 58, name: '히브리서', chapters: [4,10,11,12,13] },
  { num: 59, name: '야고보서', chapters: [1,2,3,4,5] },
  { num: 60, name: '베드로전서', chapters: [1,2,3,5] },
  { num: 62, name: '요한일서', chapters: [1,3,4,5] },
  { num: 24, name: '예레미야', chapters: [17,29,31,33] },
  { num: 1,  name: '창세기',   chapters: [1,12,15,28] },
  { num: 5,  name: '신명기',   chapters: [6,28,31,33] },
  { num: 42, name: '누가복음', chapters: [1,6,10,15] },
  { num: 48, name: '갈라디아서', chapters: [2,5,6] },
  { num: 51, name: '골로새서', chapters: [1,3] },
  { num: 66, name: '요한계시록', chapters: [1,2,21,22] },
];

const searchBibleText = async (keyword, maxResults = 12) => {
  const results = [];
  
  for (const bookInfo of SEARCH_BOOKS) {
    if (results.length >= maxResults) break;

    for (const ch of bookInfo.chapters) {
      if (results.length >= maxResults) break;

      try {
        const url = `https://bolls.life/get-chapter/KRV/${bookInfo.num}/${ch}/`;
        const res = await fetch(url, { headers: { Accept: 'application/json' } });
        if (!res.ok) continue;
        const data = await res.json();

        for (const verse of data) {
          if (results.length >= maxResults) break;
          const text = cleanText(verse.text);
          if (text.includes(keyword)) {
            results.push({
              ref: `${bookInfo.name} ${ch}:${verse.verse}`,
              text,
            });
          }
        }
      } catch {
        continue;
      }
    }
  }

  return results;
};

// 구절 참조 파싱: "시편 23:1" → { book, ch, v }
const parseRef = (q) => {
  const m = q.match(/^(.+?)\s+(\d+):(\d+)$/);
  if (!m) return null;
  const bookName = m[1].trim();
  const book = BOOK_API_MAP[bookName];
  if (!book) return null;
  return { ref: q, book, ch: parseInt(m[2]), v: parseInt(m[3]) };
};

const Search = () => {
  const { toggleFavorite, isFavorite } = useContext(UserContext);
  const [query, setQuery] = useState('');
  const [allResults, setAllResults] = useState([]);   // 전체 결과
  const [visibleCount, setVisibleCount] = useState(PAGE_SIZE); // 현재 보여줄 개수
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [currentTopic, setCurrentTopic] = useState('');
  const [searchMode, setSearchMode] = useState(''); // 'topic' | 'text' | 'ref'

  const loadTopicVerses = useCallback(async (topicName) => {
    setCurrentTopic(topicName);
    setSearchMode('topic');
    const verses = TOPIC_VERSES[topicName];
    // 처음 PAGE_SIZE 개만 즉시 fetch
    const firstBatch = await Promise.all(
      verses.slice(0, PAGE_SIZE).map(async (info) => {
        try { return { ref: info.ref, text: await fetchVerse(info), info }; }
        catch { return { ref: info.ref, text: '(본문 로딩 오류)', info }; }
      })
    );
    setAllResults(firstBatch);
    setLoading(false);
    // 나머지는 백그라운드로 fetch
    if (verses.length > PAGE_SIZE) {
      const rest = await Promise.all(
        verses.slice(PAGE_SIZE).map(async (info) => {
          try { return { ref: info.ref, text: await fetchVerse(info), info }; }
          catch { return { ref: info.ref, text: '(본문 로딩 오류)', info }; }
        })
      );
      setAllResults(prev => [...prev, ...rest]);
    }
  }, []);

  const doSearch = useCallback(async (q) => {
    const trimmed = q.trim();
    if (!trimmed) return;
    setLoading(true);
    setError('');
    setAllResults([]);
    setVisibleCount(PAGE_SIZE);
    setCurrentTopic('');
    setSearchMode('');

    try {
      // 1. 정확한 구절 참조 (예: 요한복음 3:16)
      const parsed = parseRef(trimmed);
      if (parsed) {
        const text = await fetchVerse(parsed);
        setAllResults([{ ref: parsed.ref, text }]);
        setSearchMode('ref');
        setLoading(false);
        return;
      }

      // 2. 주제 키워드 매칭 (정확히 일치)
      const matchedTopic = TOPICS.find(t => trimmed === t);
      if (matchedTopic) {
        await loadTopicVerses(matchedTopic);
        return;
      }

      // 3. 전체 성경 텍스트 검색 (이제 어떤 키워드든 검색 가능!)
      setSearchMode('text');
      const results = await searchBibleText(trimmed, 12);
      if (results.length > 0) {
        setAllResults(results);
        setLoading(false);
        return;
      }

      // 4. 부분 주제 매칭 (마지막 시도)
      const fuzzy = TOPICS.find(t => t.includes(trimmed) || trimmed.includes(t.substring(0, 2)));
      if (fuzzy) {
        await loadTopicVerses(fuzzy);
        return;
      }

      setError(`"${trimmed}"이(가) 포함된 구절을 찾지 못했습니다. 다른 키워드로 시도해 보세요.`);
    } catch (e) {
      setError('말씀을 불러오는 중 오류가 발생했습니다.');
    } finally {
      setLoading(false);
    }
  }, [loadTopicVerses]);

  const handleLoadMore = () => {
    setVisibleCount(prev => prev + PAGE_SIZE);
  };

  const handleKeyDown = (e) => { if (e.key === 'Enter') doSearch(query); };

  const visibleResults = allResults.slice(0, visibleCount);
  const hasMore = visibleCount < allResults.length;

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.5 }}
      style={{ maxWidth: '800px', margin: '0 auto' }}>

      <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
        <h2 className="serif-font" style={{ fontSize: 'clamp(1.6rem, 4vw, 2.5rem)', color: 'var(--accent-gold)', marginBottom: '0.5rem' }}>
          말씀 찾기
        </h2>
        <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
          어떤 단어든 검색하세요 — 성경 전체에서 찾아드립니다
        </p>
      </div>

      {/* Search Input */}
      <div style={{ position: 'relative', marginBottom: '1rem' }}>
        <SearchIcon color="var(--accent-gold)" size={20}
          style={{ position: 'absolute', left: '1.2rem', top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none' }} />
        <input type="text" value={query}
          onChange={(e) => setQuery(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="예: 사랑, 두려움, 감사, 은혜, 요한복음 3:16"
          style={{ width: '100%', padding: '1rem 3.5rem 1rem 3rem', fontSize: '1rem', borderRadius: '30px',
            border: '1px solid var(--accent-gold)', background: 'var(--glass-bg)',
            color: 'var(--text-primary)', outline: 'none', boxShadow: 'var(--shadow-md)' }} />
        {query && (
          <button onClick={() => { setQuery(''); setAllResults([]); setError(''); setCurrentTopic(''); setSearchMode(''); }}
            style={{ position: 'absolute', right: '1rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-secondary)', display: 'flex', padding: '0.3rem' }}>
            <X size={18} />
          </button>
        )}
      </div>

      <button onClick={() => doSearch(query)} disabled={loading || !query.trim()}
        className="btn-primary"
        style={{ width: '100%', justifyContent: 'center', marginBottom: '1.5rem', opacity: !query.trim() ? 0.5 : 1 }}>
        {loading ? <Loader2 size={18} style={{ animation: 'spin 1s linear infinite' }} /> : <SearchIcon size={18} />}
        {loading ? '성경을 검색하는 중...' : '말씀 검색'}
      </button>

      {/* Topic Chips */}
      <div style={{ marginBottom: '2rem' }}>
        <p style={{ fontSize: '0.82rem', color: 'var(--text-secondary)', marginBottom: '0.8rem', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
          <Tag size={13} /> 주제로 찾기
        </p>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
          {TOPICS.map((cat) => (
            <button key={cat}
              onClick={() => { setQuery(cat); doSearch(cat); }}
              style={{ padding: '0.4rem 1.1rem', borderRadius: '20px',
                border: `1px solid ${currentTopic === cat ? 'var(--accent-gold)' : 'var(--glass-border)'}`,
                background: currentTopic === cat ? 'var(--accent-gold)' : 'var(--glass-bg)',
                color: currentTopic === cat ? '#fff' : 'var(--text-primary)',
                fontSize: '0.88rem', cursor: 'pointer', transition: 'all 0.2s', minHeight: '36px' }}>
              # {cat}
            </button>
          ))}
        </div>
      </div>

      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>

      {error && (
        <div style={{ background: 'rgba(255,100,100,0.08)', border: '1px solid rgba(255,100,100,0.2)',
          borderRadius: '12px', padding: '1rem 1.2rem', color: 'var(--text-secondary)', fontSize: '0.9rem', marginBottom: '1.5rem' }}>
          {error}
        </div>
      )}

      <AnimatePresence>
        {visibleResults.length > 0 && (
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}>
            <p style={{ fontSize: '0.82rem', color: 'var(--text-secondary)', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
              <BookOpen size={13} />
              {searchMode === 'text' ? `"${query}" 검색 결과` : `"${query}" 관련 말씀`} — {visibleResults.length} / {allResults.length}개 구절
              {searchMode === 'topic' && allResults.length < TOPIC_VERSES[currentTopic]?.length && (
                <span style={{ marginLeft: '0.5rem', color: 'var(--accent-gold)' }}>
                  (로딩 중...)
                </span>
              )}
            </p>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              {visibleResults.map((r, i) => (
                <motion.div key={r.ref + i} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: Math.min(i, 3) * 0.06 }}
                  className="glass-card" style={{ padding: '1.3rem 1.5rem', display: 'flex', flexDirection: 'column', gap: '0.7rem' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '1rem' }}>
                    <div style={{ flex: 1 }}>
                      <p style={{ fontSize: '0.78rem', color: 'var(--accent-gold)', fontWeight: 700, marginBottom: '0.5rem' }}>{r.ref}</p>
                      <p className="serif-font" style={{ fontSize: 'clamp(0.95rem, 2.2vw, 1.1rem)', lineHeight: 1.8, wordBreak: 'keep-all' }}>
                        &ldquo;{r.text}&rdquo;
                      </p>
                    </div>
                    <button onClick={() => toggleFavorite({ ref: r.ref, text: r.text })}
                      style={{ color: isFavorite(r.ref) ? '#ef4444' : 'var(--text-secondary)', flexShrink: 0,
                        minWidth: '44px', minHeight: '44px', display: 'flex', alignItems: 'center', justifyContent: 'center',
                        borderRadius: '50%', border: '1px solid var(--glass-border)', transition: 'all 0.2s' }}>
                      <Heart size={18} fill={isFavorite(r.ref) ? '#ef4444' : 'none'} />
                    </button>
                  </div>
                  <Link to="/devotion" state={{ verse: r.ref, verseText: r.text }}
                    style={{ fontSize: '0.8rem', color: 'var(--accent-gold)', fontWeight: 600, alignSelf: 'flex-start' }}>
                    ✏️ 이 말씀으로 묵상 쓰기
                  </Link>
                </motion.div>
              ))}
            </div>

            {/* 더 보기 버튼 */}
            {hasMore && (
              <motion.button
                initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                onClick={handleLoadMore}
                style={{ width: '100%', marginTop: '1.5rem', padding: '0.9rem', borderRadius: '30px',
                  border: '1px solid var(--accent-gold)', background: 'transparent',
                  color: 'var(--accent-gold)', fontWeight: 600, cursor: 'pointer',
                  display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem',
                  fontSize: '0.95rem', transition: 'all 0.2s' }}
                onMouseOver={e => e.currentTarget.style.background = 'rgba(196,164,132,0.12)'}
                onMouseOut={e => e.currentTarget.style.background = 'transparent'}>
                <ChevronDown size={18} />
                더 보기 ({allResults.length - visibleCount}개 더 있음)
              </motion.button>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};

export default Search;

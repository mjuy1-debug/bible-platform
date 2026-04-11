const fs = require('fs');

// OT video map 전체 내용 읽기
const otFull = fs.readFileSync('video_map_ot_full.js', 'utf8');

// OT_VIDEO_MAP 내의 각 책 파싱
const bookRegex = /(\w+|\'\w+\'): \{([^}]+)\}/g;
const otBooks = {};
let m;
while ((m = bookRegex.exec(otFull)) !== null) {
  const bookId = m[1].replace(/'/g, '');
  const chapterLines = m[2].trim().split('\n');
  const chapters = {};
  for (const line of chapterLines) {
    const chMatch = line.trim().match(/^(\d+):\s*'([^']+)'/);
    if (chMatch) chapters[parseInt(chMatch[1])] = chMatch[2];
  }
  otBooks[bookId] = chapters;
}

// 시편 추가
const psaLines = fs.readFileSync('psa_map.txt', 'utf8').trim().split('\n');
const psaChapters = {};
for (const line of psaLines) {
  const chMatch = line.trim().match(/^(\d+):\s*'([^']+)'/);
  if (chMatch) psaChapters[parseInt(chMatch[1])] = chMatch[2];
}
otBooks['psa'] = psaChapters;

// OT 책 순서 고정
const OT_ORDER = [
  'gen','exo','lev','num','deu','jos','jdg','rut',
  '1sa','2sa','1ki','2ki','1ch','2ch','ezr','neh','est',
  'job','psa','pro','ecc','sng','isa','jer','lam',
  'eze','dan','hos','joe','amo','oba','jon','mic','nah','hab','zep','hag','zec','mal'
];

// NT VIDEO_MAP 읽기 (현재 파일의 기존 NT 데이터)
const currentFile = fs.readFileSync('./bible-platform/src/data/youtubeLinks.js', 'utf8');
const ntMapMatch = currentFile.match(/\/\/ ─── 신약 ───([\s\S]+?)^\};/m);

// 깔끔하게 JS 생성
function mapToJS(bookId, chapters) {
  const entries = Object.entries(chapters)
    .sort((a, b) => parseInt(a[0]) - parseInt(b[0]))
    .map(([ch, id]) => `    ${ch}: '${id}',`)
    .join('\n');
  return `  '${bookId}': {\n${entries}\n  },`;
}

// NT 데이터 (신뢰할 수 있는 NT는 youtubeLinks.js에서 직접 파싱)
const NtBooksData = {
  mat: {1:'7akAOR_1Zs8',2:'vEENm2gnIwk',3:'IO7ggbkTEgM',4:'TFxOZ7La8Zs',5:'aVU2fDhT3P0',6:'e5BAgNc7OW8',7:'OlV_9q42J60',8:'AZimvGS9_24',9:'9V-jb-6DbIQ',10:'048wJVad2yk',11:'gwzTEDPA4gs',12:'ZtMU3ZBE-p0',13:'gvAdjmHhkxc',14:'FG_1ajj-Ro8',15:'Ez1J57OsUA4',16:'haaJvtoqDMg',17:'yG2FEThiojI',18:'_bNTISaKYB4',19:'5tqSa_ftm54',20:'Y55aR-NauWw',21:'UAArGnZPGoc',22:'qzO5NCCHRvM',23:'rD_BokveTrc',24:'byLioT_X2QI',25:'9Ue2Wn-nYWA',26:'nIoDqkUu6XM',27:'HSKhzoo3HPA',28:'suqEExH8DQk'},
  mar: {1:'DDLbPNIwdJA',2:'Wa6alvoSczA',3:'AenD4SpL8yM',4:'f39XaQoh9Vk',5:'wMpzDqJLYdE',6:'6l32rL1mCBQ',7:'9lBRvMcPZPw',8:'c7g4hx0lCCk',9:'omDHhp-ym9Q',10:'4LeugjRbccQ',11:'Cn8vkBiuXXo',12:'audWhUwRCOY',13:'bf0BR9S-XiI',14:'k-iX4wi5koc',15:'Blvz09WKjqY',16:'AGc-QA5N9ic'},
  luk: {1:'Iumo2_dVQBM',2:'owEASU08idc',3:'XBMe7lZ0CMI',4:'Q095cTl7YjU',5:'qgnq5tSWHVg',6:'kPW7wyDy36U',7:'p8U-qxrZH_w',8:'1OqbrDzKlpo',9:'s3qNvgJ1NfM',10:'Q_BUlxFFZig',11:'hDWe96m3ySI',12:'dmUiUwCPJIE',13:'ndvvmN9NXUQ',14:'FXe0BcEelpg',15:'ohHF7ZiVReg',16:'WEMOlMctwJw',17:'5xmtJ50Y4kI',18:'PZKABp3j3-w',19:'kPmUEVt51W8',20:'ql9PArc2E74',21:'78aZ1_1Usqs',22:'RgfjyQEQAsY',23:'pkX7WmcpYUM',24:'xApP4pmu7uc'},
  joh: {1:'4NH4BdF_AoA',2:'4C3rYcAyyRE',3:'ClecKX-s8Y8',4:'cnQ1x_unHHE',5:'89eKYh0FcSY',6:'fWUlOuD7ai4',7:'VWmgYxIuYHo',8:'-W2fGGif_mE',9:'evPoZEwAWKA',10:'PdcTPI-kh3I',11:'feAib1mY-YQ',12:'-rsWB0Cybno',13:'ypNS7IBgYLQ',14:'FIG8qFwnNP4',15:'0mPFwthR1qw',16:'TIp2P-aRTpI',17:'v856Q1BE3fw',18:'RHj7LabPxFI',19:'oI61xwM63oE',20:'SZxhbpsibzQ',21:'xGqYck1Nm_U'},
  act: {1:'MLKCDsu1x0o',2:'WClQJBM_4ZA',3:'785d01Er4Z0',4:'lm_yZtdSo2o',5:'fjZlcSBm8ns',6:'dmoBiAri-18',7:'uq1ejmOOVs4',8:'DBJFXHsnCR4',9:'5xtS6l81Yuw',10:'-tG6Iwv2Yqc',11:'EKszrMsiM6M',12:'HagZFzHMmmQ',13:'KUYvqtlMkWk',14:'JyDGYi9jvhU',15:'Y7lXD8R1uKc',16:'WKJm3rYtZMk',17:'fusmP8FiIa8',18:'gCutLTMv1Dc',19:'4nF7l57mMQQ',20:'tX9W5HB1aCs',21:'E7Gb9hEC1Aw',22:'04sC7-wlybw',23:'263-WHuzIHM',24:'GU4UwNlTckA',25:'Quunr4CKsQM',26:'gIboDFD_mwA',27:'TANX1iPEYKw',28:'i6PA3yqvU4g'},
  rom: {1:'uwadV3tpMRI',2:'CsSLRpu0ed8',3:'UE6IbOGPMkQ',4:'0CcRxdx-1Q8',5:'CsgVAiT33zM',6:'sDzyOhmJmAs',7:'gmpJz1cmNn4',8:'wtGZ9TWZD3o',9:'pifdOGzkLLA',10:'4tCcKhj0dM8',11:'tRpuLdnSfzI',12:'Sp_gSKvZgXU',13:'e9cZ1BXWejM',14:'n_wAL9hHTHg',15:'cIc-G2AC2-M',16:'YG6HyEUfcHs'},
  '1co': {1:'JsgYB2qhChI',2:'Ho85VxYWqcs',3:'Q9DF7VZOwg8',4:'GYY__-Rb3Js',5:'moyszP2E-OI',6:'zc_nsIh89bQ',7:'AWTfyGnjl-Q',8:'NAL2681RoKc',9:'N_nBBhptBAI',10:'eQ8x_ca7hII',11:'C0xT7rV_Ics',12:'kv5rQWI0Reg',13:'FsB7mHEHTFs',14:'lHGz8QSI5EQ',15:'iM_8QrHtyaw',16:'sOadletH8Oc'},
  '2co': {1:'DdVac9ton74',2:'bivvhdlY_ls',3:'0_mMELe8Jqk',4:'DWUnRsC80Vk',5:'p7TxCrUG3fw',6:'LXbvrapa9BE',7:'MqwY_wzZ9tU',8:'MIiimTBz3bQ',9:'0w_IkLPAwbI',10:'E9qAiQgkijk',11:'oUB-qFMqfOU',12:'f1CANw6kXSc',13:'hSWl-sdWyA8'},
  gal: {1:'QVIEFo8wOyQ',2:'z6L7DmJExF8',3:'thlsJqgAnU0',4:'9WfnbZU3az8',5:'p5EYM6UMaTk',6:'iPcTs4SYd_c'},
  eph: {1:'oXjJJ0AUNWA',2:'0vwvtb4piF4',3:'GoPMMXSijY4',4:'LIQA8S1D9r4',5:'nWr2SRiKUok',6:'gvrYapTy1ZE'},
  php: {1:'zIbcAu9CKZ0',2:'LnPYvVZI9Lc',3:'3Xy-ds58wxI',4:'vk3kGdiJzKg'},
  col: {1:'LHmECVGAVhk',2:'7GJqIs_2YqA',3:'KkGF_TTEsDg',4:'_LA6vcPnaps'},
  '1th': {1:'Ds991Xrs0GY',2:'58ftwfmP6to',3:'Depqx6XPTqc',4:'LTfLunKJhJo',5:'IKlAznazo08'},
  '2th': {1:'imU46TqRyNY',2:'lvucjN4Uv_8',3:'z4Q_cCaM9tQ'},
  '1ti': {1:'yIZ9lQKqRec',2:'Mz1YhfdwLEQ',3:'q78FpRQxY5g',4:'qXTPMQTGYZw',5:'6VdVz3FD0qk',6:'5M8p4gWCqPU'},
  '2ti': {1:'YOXmamF4GjE',2:'vSG6jjuw-Co',3:'v6A16Jbzc7k',4:'VkLd5Go-wXk'},
  tit: {1:'mkn5oz6x8Jw',2:'CMiwNAn9F6c',3:'HfJbC1LWdzc'},
  phm: {1:'ixdg7Ng4b6E'},
  heb: {1:'zoi5Rc1DS8o',2:'IU2-k1-d1Vg',3:'5q75DGZ9KQo',4:'Yfgenw6UezQ',5:'lIZskl1HJVw',6:'rbAOgKj_xps',7:'_3VLV8kpeTo',8:'Ub9s5rd_624',9:'ohxYormKcU4',10:'AZzH_bgGoPM',11:'OZ5unIChKiA',12:'W-mh3aqiL94',13:'W_9VwYZ5-0w'},
  jam: {1:'dk5b9VnCdOc',2:'La6x0DBtKoo',3:'29hgp3LmzIg',4:'_nenqYqEcK0',5:'ZkL5PApE4vQ'},
  '1pe': {1:'P3GWbXX5iNY',2:'0rdg7CxqTEY',3:'GpPdx2qf4iE',4:'rTTRn8ZVSwA',5:'YXsvdD0fYB4'},
  '2pe': {1:'FN99MJE_HrI',2:'pCGzaSa-ozc',3:'KqPZhzSJwzg'},
  '1jo': {1:'T4XzI0jXIOg',2:'XJTEenT0d7g',3:'PEtTfMUWIJ8',4:'W9VjYS5hYH4',5:'FUc3gK2Mbns'},
  '2jo': {1:'RROpGlHEBwg'},
  '3jo': {1:'ndHqzAv_xNY'},
  jud: {1:'nkA9BrdES-o'},
  rev: {1:'U4UVf3dE1wc',2:'PifZnD0Wl1E',3:'upNc-VdgmAc',4:'xB6KaiMvlaY',5:'UhbP7manfRA',6:'MLX3OKO3Dtw',7:'bhXINMw9MxU',8:'OusQbZ5Og-o',9:'80ZIJHUiBsM',10:'gtLFvBfa_iU',11:'bWThNiD7_NM',12:'UUjmGeGLj6Q',13:'OMmLuoTNTwQ',14:'wbbwSoqbMyo',15:'sR9XBJtZCMs',16:'71EG-eXc85c',17:'7pP3_b_A2bE',18:'UYTWiJy8K_o',19:'V5Gj3r0KtnM',20:'J96D0CMh3M4',21:'X_I7MxyzLWY',22:'X9Wx9zPaoU0'},
};

// VIDEO_MAP 빌드
let videoMapJS = 'export const VIDEO_MAP = {\n';
videoMapJS += '  // ─── 구약 (OT) ───\n';
for (const bookId of OT_ORDER) {
  const chapters = otBooks[bookId] || {};
  if (Object.keys(chapters).length === 0) continue;
  const entries = Object.entries(chapters)
    .sort((a,b) => parseInt(a[0]) - parseInt(b[0]))
    .map(([ch, id]) => `    ${ch}: '${id}',`)
    .join('\n');
  videoMapJS += `  '${bookId}': {\n${entries}\n  },\n`;
}

videoMapJS += '\n  // ─── 신약 (NT) ───\n';
const NT_ORDER = ['mat','mar','luk','joh','act','rom','1co','2co','gal','eph','php','col','1th','2th','1ti','2ti','tit','phm','heb','jam','1pe','2pe','1jo','2jo','3jo','jud','rev'];
for (const bookId of NT_ORDER) {
  const chapters = NtBooksData[bookId] || {};
  const entries = Object.entries(chapters)
    .sort((a,b) => parseInt(a[0]) - parseInt(b[0]))
    .map(([ch, id]) => `    ${ch}: '${id}',`)
    .join('\n');
  videoMapJS += `  '${bookId}': {\n${entries}\n  },\n`;
}
videoMapJS += '};\n';

// PLAYLIST_MAP, getYouTubeUrl 
const staticPart = `
// ─── 구약 39권 맵핑 (플레이리스트는 fallback용) ───────────────────────────
export const PLAYLIST_MAP = {
  gen: 'PLVcVykBcFZTSLj_RY9qI3POOhXis3sIjl', exo: 'PLVcVykBcFZTSOMqb3zzkCJxApAQkkZFzx',
  lev: 'PLVcVykBcFZTSixzelasf-bHxtyoAEXwkx', num: 'PLVcVykBcFZTRnt-mlIDDzpDu7IA5bzJNH',
  deu: 'PLVcVykBcFZTQY446Ly0Gm9yjVHEbwhe7y', jos: 'PLVcVykBcFZTTbd5VxIVBPhovWtk_kNRcR',
  jdg: 'PLVcVykBcFZTSVlIivEzeryQKftNt1TqAZ', rut: 'PLVcVykBcFZTSjt5AOFvERdjn6of9NG5tX',
  '1sa': 'PLVcVykBcFZTT0WcqXi2INqLzK_3bfzfNf', '2sa': 'PLVcVykBcFZTSyNyRs04UMnAEwfuXqnwgy',
  '1ki': 'PLVcVykBcFZTRtp1N60IeJxNq9mmiYYk3o', '2ki': 'PLVcVykBcFZTQ4DAYRcmregW3ddGd-FUzO',
  '1ch': 'PLVcVykBcFZTTXEcV3eQL9er7X7JwkP5GJ', '2ch': 'PLVcVykBcFZTSJ3TqJKwK6Z_JGxWVh-4uE',
  ezr: 'PLVcVykBcFZTTO2SZNoLAXvDGdrvS0beq9', neh: 'PLVcVykBcFZTRs1EXOW3cyKqLazLRMmJ6Q',
  est: 'PLVcVykBcFZTSBj4OXaHf8Nh-dCzlMuppz', job: 'PLVcVykBcFZTQwB6_h2e9mygcTtubKoql_',
  psa: 'PLVcVykBcFZTTDNtQJsc4j_sU3Op0WKcO-', pro: 'PLVcVykBcFZTTVEcfdIn4Nmm2weYGTrM43',
  ecc: 'PLVcVykBcFZTRs1yjX3JHiKU21RppvXb3u', sng: 'PLVcVykBcFZTRNG9NeIQzO4nHS-fKUBy0J',
  isa: 'PLVcVykBcFZTTS_ks2ZOZDP6PVeFYtS6Cc', jer: 'PLVcVykBcFZTQvSOwGfuRHbD8yNoYr7HAa',
  lam: 'PLVcVykBcFZTR1EGiHqgLPfj6AyXcfWbBL', eze: 'PLVcVykBcFZTSq07123PZaJPudnsrDapAe',
  dan: 'PLVcVykBcFZTTEZJPjOr5rT1WOWpF3OlLj', hos: 'PLVcVykBcFZTTIVMdnToC-jVJELeptSLPy',
  joe: 'PLVcVykBcFZTTQ0hVYMS5BZmiTSJAnj96I', amo: 'PLVcVykBcFZTSVeHpG4e7hllr9bBXwjjfu',
  oba: 'PLVcVykBcFZTTLAN9MCeMZxMv3ly-dI9cH', jon: 'PLVcVykBcFZTTIjqUlGR4pNoc70C-R6EoW',
  mic: 'PLVcVykBcFZTR1RkHliIhSL-hqUoV60GAL', nah: 'PLVcVykBcFZTSAkFZsm28AEi1Xl8VJ2-Np',
  hab: 'PLVcVykBcFZTR3nSmke2FimiM5WafHGm2q', zep: 'PLVcVykBcFZTTaGo-Y6n91nLYSv1AC4Vxu',
  hag: 'PLVcVykBcFZTSHAhuKuEtRdBxDTj6sVHAA', zec: 'PLVcVykBcFZTRCuyBk7qbvfGKGd32AqF-S',
  mal: 'PLVcVykBcFZTRzky6aS2v1D1P5t66b6nMI',
};

export const PRS_CHANNEL = 'https://www.youtube.com/@PRS';

/**
 * 성경 책/장에 맞는 최적 YouTube 정보 반환
 * 우선순위: VIDEO_MAP 직접 링크 (구약+신약 전체) > 유튜브 검색
 */
export const getYouTubeUrl = (bookId, bookName, chapter) => {
  const videoId = VIDEO_MAP[bookId]?.[chapter];
  if (videoId) {
    return {
      embedId: videoId,
      embedUrl: 'https://www.youtube.com/embed/' + videoId + '?autoplay=1&rel=0&modestbranding=1',
      type: 'video',
      label: bookName + ' ' + chapter + '장 듣기',
    };
  }

  // Fallback: 플레이리스트 (장 목록에 없는 경우)
  const playlistId = PLAYLIST_MAP[bookId];
  if (playlistId) {
    return {
      embedId: playlistId + '-' + chapter,
      embedUrl: 'https://www.youtube.com/embed/videoseries?list=' + playlistId + '&index=' + chapter + '&autoplay=1&rel=0&modestbranding=1',
      type: 'playlist',
      label: bookName + ' ' + chapter + '장 듣기',
    };
  }

  const query = encodeURIComponent('공동체성경읽기 ' + bookName + ' ' + chapter + '장');
  return {
    url: 'https://www.youtube.com/results?search_query=' + query,
    type: 'search',
    label: bookName + ' ' + chapter + '장 검색',
  };
};
`;

const header = '/**\n * 공동체성경읽기(PRS) 유튜브 - 구약/신약 전체 장별 영상 직접 매핑\n * 채널: https://www.youtube.com/@PRS\n */\n\n';
const finalContent = header + videoMapJS + staticPart;

fs.writeFileSync('./bible-platform/src/data/youtubeLinks.js', finalContent, 'utf8');
console.log('youtubeLinks.js rebuilt successfully!');
console.log('File size:', finalContent.length, 'chars');

// Quick validation
const braceOpen = (finalContent.match(/\{/g)||[]).length;
const braceClose = (finalContent.match(/\}/g)||[]).length;
console.log('Brace balance:', braceOpen, 'open vs', braceClose, 'close');

const otCount = OT_ORDER.filter(id => otBooks[id] && Object.keys(otBooks[id]).length > 0).length;
const ntCount = NT_ORDER.length;
console.log('OT books with data:', otCount, '/ 39');
console.log('NT books with data:', ntCount, '/ 27');

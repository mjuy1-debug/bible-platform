import fs from 'fs';

const inputFile = './bible_places_master.csv';
const outputFile = './src/data/locations.json';

// 간단한 CSV 파서 (따옴표 처리 포함)
function parseCSV(text) {
  const lines = text.split('\n');
  if (lines.length < 2) return [];

  const headers = lines[0].split(',');
  const result = [];

  for (let i = 1; i < lines.length; i++) {
    const line = lines[i].trim();
    if (!line) continue;

    const obj = {};
    let currentCell = '';
    let inQuotes = false;
    let colIndex = 0;

    for (let c = 0; c < line.length; c++) {
      const char = line[c];
      
      if (char === '"') {
        if (inQuotes && line[c + 1] === '"') {
          // escaped quote
          currentCell += '"';
          c++;
        } else {
          // toggle quotes
          inQuotes = !inQuotes;
        }
      } else if (char === ',' && !inQuotes) {
        obj[headers[colIndex].trim()] = currentCell.trim();
        currentCell = '';
        colIndex++;
      } else {
        currentCell += char;
      }
    }
    // last column
    if (colIndex < headers.length) {
      obj[headers[colIndex].trim()] = currentCell.trim();
    }

    result.push(obj);
  }

  return result;
}

function processData() {
  const csvContent = fs.readFileSync(inputFile, 'utf-8');
  const records = parseCSV(csvContent);

  const locations = records.map(record => {
    // verses 컬럼을 파싱하여 배열로 변환
    let verses = [];
    if (record.verses && record.verses.trim().length > 0) {
      verses = record.verses.split(';').map(v => v.trim()).filter(v => v);
    }
    
    // name_ko_alt를 배열로 변환
    let altNames = [];
    if (record.name_ko_alt && record.name_ko_alt.trim().length > 0) {
      altNames = record.name_ko_alt.split('/').map(n => n.trim()).filter(n => n);
    }

    return {
      id: record.id,
      name: record.name_ko, // 앱에서는 주로 한글명을 메인으로 사용
      name_en: record.name_en,
      name_ko_alt: altNames,
      type: record.type,
      lat: parseFloat(record.lat),
      lng: parseFloat(record.lng),
      verses: verses,
      status: record.status
    };
  });

  fs.writeFileSync(outputFile, JSON.stringify(locations, null, 2));
  console.log(`Successfully converted ${locations.length} records to ${outputFile}`);
}

processData();

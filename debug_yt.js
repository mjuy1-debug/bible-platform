const fs = require('fs');

// Check for any syntax issues - look for negative numbers used as keys which would be invalid JS
const content = fs.readFileSync('./bible-platform/src/data/youtubeLinks.js', 'utf8');

// Find lines with numbers that might cause issues
const lines = content.split('\n');
const problematic = [];
lines.forEach((line, i) => {
  // Look for patterns like "-W2fGGif_mE" - video IDs that start with a minus are fine as string values
  // But look for keys that start with minus (invalid)
  if (/^\s+\-\d+:/.test(line)) {
    problematic.push({ lineNum: i+1, content: line });
  }
  // Look for keys with dots or other invalid chars
  if (/^\s+\d+\.\d+:/.test(line)) {
    problematic.push({ lineNum: i+1, content: line });
  }
});

if (problematic.length) {
  console.log('Problematic lines found:');
  problematic.forEach(p => console.log(`Line ${p.lineNum}: ${p.content}`));
} else {
  console.log('No obvious key issues found.');
}

// Also check if there are malformed keys (numbers followed by letters without quotes)
const badKey = lines.filter((l, i) => {
  const m = l.match(/^\s+(\w+):\s/);
  return m && /^\d.*[a-zA-Z]/.test(m[1]);
}).slice(0, 5);
if (badKey.length) {
  console.log('Possible bad keys:', badKey);
}

// Check for unquoted keys starting with number (already identified above)
// Check for duplicate structure issues
const braceCount = (content.match(/\{/g) || []).length;
const closeBraceCount = (content.match(/\}/g) || []).length;
console.log('Open braces:', braceCount, 'Close braces:', closeBraceCount);

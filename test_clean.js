fetch('https://bolls.life/get-chapter/NIV/1/1/')
  .then(r => r.json())
  .then(raw => {
    console.log('Sample raw 1:', raw[0]);
    const verses = raw.map(v => {
      let cleanText = v.text
        .replace(/<h\d?[^>]*>.*?<\/h\d?>/gi, ' ')
        .replace(/<b[^>]*>.*?<\/b>/gi, ' ')
        .replace(/<[^>]+>/g, ' ')
        .replace(/&nbsp;/g, ' ')
        .replace(/&amp;/g, '&')
        .replace(/&lt;/g, '<')
        .replace(/&gt;/g, '>')
        .replace(/&#39;/g, "'")
        .replace(/&quot;/g, '"')
        .replace(/\s+/g, ' ')
        .trim();
      return { verse: v.verse, text: cleanText };
    });
    console.log('Verse 1 clean:', verses[0]);
    console.log('Verse 2 clean:', verses[1]);
  });

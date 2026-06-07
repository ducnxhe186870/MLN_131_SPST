const axios = require('axios');
const fs = require('fs');

const cases = [
  { q: 'tòa án xét xử Tamexco site:vnexpress.net OR site:tuoitre.vn', f: 'tamexco.jpg' },
  { q: 'xét xử Tăng Minh Phụng site:vnexpress.net OR site:tuoitre.vn', f: 'epco.jpg' },
  { q: 'Bùi Tiến Dũng PMU 18 xét xử trước tòa site:vnexpress.net OR site:tuoitre.vn', f: 'pmu18.jpg' },
  { q: 'Huỳnh Ngọc Sĩ tòa án xét xử site:vnexpress.net OR site:tuoitre.vn', f: 'pci.jpg' },
  { q: 'Phạm Thanh Bình Vinashin xét xử site:vnexpress.net OR site:tuoitre.vn', f: 'vinashin.jpg' },
  { q: 'Trương Mỹ Lan vạn thịnh phát tòa án site:vnexpress.net OR site:tuoitre.vn', f: 'vtp.jpg' },
  { q: 'Phan Quốc Việt xét xử tòa án site:vnexpress.net OR site:tuoitre.vn', f: 'vieta.jpg' }
];

async function run() {
  for (let c of cases) {
    try {
      console.log('Searching Google Images for', c.f);
      const url = `https://www.google.com/search?q=${encodeURIComponent(c.q)}&tbm=isch`;
      const res = await axios.get(url, { headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)' } });
      
      let imgUrl = null;
      const matches = [...res.data.matchAll(/<img[^>]+src="(https:\/\/[^"]+)"/g)];
      
      // The first img tag is usually the Google logo, so we take the second or third one which are the actual search results.
      for (let match of matches) {
         if (match[1] && !match[1].includes('branding/googlelogo')) {
             imgUrl = match[1];
             break;
         }
      }

      if (imgUrl) {
        console.log('Downloading', imgUrl);
        const imgRes = await axios.get(imgUrl, { responseType: 'stream' });
        const writer = fs.createWriteStream(c.f);
        imgRes.data.pipe(writer);
        await new Promise(r => writer.on('finish', r)); // Wait for finish
        console.log('Saved', c.f);
      } else {
        console.log('No image found for', c.f);
      }
    } catch(e) {
      console.log('Error', c.f, e.message);
    }
  }
}
run();

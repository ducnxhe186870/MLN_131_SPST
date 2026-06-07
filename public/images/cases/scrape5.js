const axios = require('axios');
const fs = require('fs');

const cases = [
  { q: 'tamexco xét xử site:vnexpress.net OR site:tuoitre.vn', f: 'tamexco.jpg' },
  { q: 'tăng minh phụng tòa án site:tuoitre.vn OR site:vnexpress.net', f: 'epco.jpg' },
  { q: 'bùi tiến dũng pmu 18 site:vnexpress.net OR site:thanhnien.vn', f: 'pmu18.jpg' },
  { q: 'huỳnh ngọc sĩ vụ án site:tuoitre.vn OR site:vnexpress.net', f: 'pci.jpg' },
  { q: 'phạm thanh bình vinashin tòa site:tuoitre.vn OR site:vnexpress.net', f: 'vinashin.jpg' },
  { q: 'vạn thịnh phát tòa án xét xử site:vnexpress.net OR site:tuoitre.vn', f: 'vtp.jpg' },
  { q: 'phan quốc việt xét xử site:tuoitre.vn OR site:vnexpress.net', f: 'vieta.jpg' }
];

async function run() {
  for (let c of cases) {
    try {
      console.log('Searching Google Images for', c.f);
      const url = `https://www.google.com/search?q=${encodeURIComponent(c.q)}&tbm=isch`;
      const res = await axios.get(url, { headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)' } });
      
      const html = res.data;
      
      // Match all data URIs
      const base64Match = [...html.matchAll(/src="(data:image\/[^;]+;base64,[^"]+)"/g)];
      
      let imgData = null;
      let imgUrl = null;

      // Often the first base64 is a 1x1 gif placeholder. Filter for jpeg/png or substantial length
      for (let m of base64Match) {
        if (m[1].length > 1000) { // arbitrary threshold to ignore 1x1 pixels
          imgData = m[1];
          break;
        }
      }

      if (!imgData) {
          // Fallback to https url if no base64 found
          const urlMatch = [...html.matchAll(/src="(https:\/\/[^"]+)"/g)];
          for (let m of urlMatch) {
             if (m[1] && !m[1].includes('branding/googlelogo') && !m[1].includes('gstatic.com/images?q=tbn:ANd9GcQ')) {
                 imgUrl = m[1];
                 break; // grab the first valid-looking thumbnail
             }
             if (m[1] && m[1].includes('gstatic.com/images?q=tbn:')) {
                 imgUrl = m[1];
                 break;
             }
          }
      }

      if (imgData) {
        console.log('Downloading base64 for', c.f);
        const b64 = imgData.split(',')[1];
        fs.writeFileSync(c.f, Buffer.from(b64, 'base64'));
        console.log('Saved', c.f);
      } else if (imgUrl) {
        console.log('Downloading url', imgUrl);
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

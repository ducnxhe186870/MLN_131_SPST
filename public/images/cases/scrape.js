const axios = require('axios');
const cheerio = require('cheerio');
const fs = require('fs');

const cases = [
  { term: 'tamexco phạm huy phước', file: 'tamexco.jpg' },
  { term: 'tăng minh phụng epco xét xử', file: 'epco.jpg' },
  { term: 'bùi tiến dũng pmu 18', file: 'pmu18.jpg' },
  { term: 'đại lộ đông tây huỳnh ngọc sĩ', file: 'pci.jpg' },
  { term: 'phạm thanh bình vinashin', file: 'vinashin.jpg' },
  { term: 'xét xử trương mỹ lan', file: 'vtp.jpg' },
  { term: 'xét xử phan quốc việt việt á', file: 'vieta.jpg' }
];

async function run() {
  for (let c of cases) {
    try {
      console.log('Searching for:', c.term);
      const searchUrl = `https://timkiem.vnexpress.net/?q=${encodeURIComponent(c.term)}`;
      const res = await axios.get(searchUrl);
      const $ = cheerio.load(res.data);
      let articleUrl = $('article.item-news h3.title-news a').first().attr('href') || $('article.item-news a').first().attr('href');
      
      if (articleUrl) {
         console.log('Found article:', articleUrl);
         const res2 = await axios.get(articleUrl);
         const $2 = cheerio.load(res2.data);
         let imageUrl = $2('meta[property="og:image"]').attr('content') 
                       || $2('picture img').first().attr('src')
                       || $2('article img').first().attr('src');
         
         if (!imageUrl || imageUrl.includes('logo')) {
            imageUrl = $2('article img').first().attr('data-src') || $2('article img').first().attr('src');
         }

         if (imageUrl) {
           console.log('Downloading image:', imageUrl);
           const imgRes = await axios.get(imageUrl, { responseType: 'stream' });
           imgRes.data.pipe(fs.createWriteStream(c.file));
         } else {
           console.log('No image found in article', c.term);
         }
      } else {
         console.log('No article found for', c.term);
      }
    } catch(e) {
      console.log('Error', c.term, e.message);
    }
    await new Promise(r => setTimeout(r, 1000));
  }
}
run();

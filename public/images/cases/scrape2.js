const axios = require('axios');
const cheerio = require('cheerio');
const fs = require('fs');

const cases = [
  { term: 'xét xử phạm huy phước tamexco', file: 'tamexco.jpg' },
  { term: 'tăng minh phụng epco', file: 'epco.jpg' },
  { term: 'huỳnh ngọc sĩ đại lộ đông tây', file: 'pci.jpg' },
  { term: 'phạm thanh bình vinashin', file: 'vinashin.jpg' },
  { term: 'xét xử việt á', file: 'vieta.jpg' }
];

async function run() {
  for (let c of cases) {
    try {
      console.log('Searching for:', c.term);
      const searchUrl = `https://timkiem.vnexpress.net/?q=${encodeURIComponent(c.term)}`;
      const res = await axios.get(searchUrl, { timeout: 10000, headers: {'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) Chrome/120.0.0.0 Safari/537.36'} });
      const $ = cheerio.load(res.data);
      
      const articleUrls = [];
      $('article.item-news h3.title-news a').each((i, el) => {
         articleUrls.push($(el).attr('href'));
      });
      // also try tuoitre if vnexpress fails
      
      let downloaded = false;
      for (let articleUrl of articleUrls) {
         if (downloaded) break;
         if (!articleUrl.startsWith('http')) continue;
         if (articleUrl.includes('video')) continue; // skip video
         
         console.log('  Checking article:', articleUrl);
         try {
           const res2 = await axios.get(articleUrl, { timeout: 10000, headers: {'User-Agent': 'Mozilla/5.0'} });
           const $2 = cheerio.load(res2.data);
           let imageUrl = $2('meta[property="og:image"]').attr('content') 
                         || $2('picture img').first().attr('src')
                         || $2('article img').first().attr('src');
           
           if (!imageUrl || imageUrl.includes('logo') || imageUrl.includes('default') || imageUrl.includes('avatar')) {
              imageUrl = $2('article img').first().attr('data-src') || $2('article img').first().attr('src');
           }

           if (imageUrl && !imageUrl.includes('logo') && !imageUrl.includes('avatar')) {
             console.log('  Downloading image:', imageUrl);
             const imgRes = await axios.get(imageUrl, { responseType: 'stream', timeout: 10000 });
             const writer = fs.createWriteStream(c.file);
             imgRes.data.pipe(writer);
             
             await new Promise((resolve, reject) => {
                writer.on('finish', resolve);
                writer.on('error', reject);
             });
             
             downloaded = true;
             console.log('    --> Success:', c.file);
           }
         } catch(e2) {
           console.log('  Article error:', e2.message);
         }
      }
      
      // If VNE fails, try Dantri
      if (!downloaded) {
          console.log('  Fallback to Dantri for', c.term);
          const dtUrl = `https://dantri.com.vn/tim-kiem/${encodeURIComponent(c.term)}.htm`;
          const dtRes = await axios.get(dtUrl, { timeout: 10000, headers: {'User-Agent': 'Mozilla/5.0'} });
          const $dt = cheerio.load(dtRes.data);
          const dtArticleUrls = [];
          $dt('h3.article-title a').each((i, el) => {
             const path = $dt(el).attr('href');
             if(path) dtArticleUrls.push('https://dantri.com.vn' + path);
          });
          
          for (let articleUrl of dtArticleUrls) {
             if (downloaded) break;
             console.log('  Checking DT article:', articleUrl);
             try {
               const res2 = await axios.get(articleUrl, { timeout: 10000, headers: {'User-Agent': 'Mozilla/5.0'} });
               const $2 = cheerio.load(res2.data);
               let imageUrl = $2('meta[property="og:image"]').attr('content');
               
               if (imageUrl && !imageUrl.includes('logo') && !imageUrl.includes('avatar')) {
                 console.log('  Downloading image:', imageUrl);
                 const imgRes = await axios.get(imageUrl, { responseType: 'stream', timeout: 10000 });
                 const writer = fs.createWriteStream(c.file);
                 imgRes.data.pipe(writer);
                 await new Promise((resolve) => writer.on('finish', resolve));
                 downloaded = true;
                 console.log('    --> Success:', c.file);
               }
             } catch(e2) {
               console.log('  DT Article error:', e2.message);
             }
          }
      }

      if (!downloaded) console.log('FAILED to find image for', c.term);
    } catch(e) {
      console.log('Error', c.term, e.message);
    }
  }
}
run();
